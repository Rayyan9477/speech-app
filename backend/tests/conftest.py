"""
Test configuration and fixtures for the Speech App backend
Provides comprehensive test fixtures for unit, integration, and performance testing
"""

import asyncio
import tempfile
import shutil
from pathlib import Path
from typing import AsyncGenerator, Generator
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
import numpy as np
import torch
import torchaudio
from unittest.mock import Mock, MagicMock, AsyncMock, patch
import uuid
from datetime import datetime

# Import app components
from app.app import app
from app.core.config import settings
from app.database import get_database, get_vector_store, AudioProcessingSession, VoiceClone
from app.services import (
    get_stt_service, get_tts_service, get_voice_cloning_service, 
    get_file_handler, get_translation_service
)
from app.security import get_encryption


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_client():
    """Create FastAPI test client"""
    with TestClient(app) as client:
        yield client


@pytest_asyncio.fixture
async def async_test_client():
    """Create async test client"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


# Directory and file fixtures
@pytest.fixture
def temp_dir():
    """Create temporary directory for test files"""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield Path(temp_dir)


@pytest.fixture
def test_data_dir():
    """Test data directory with sample files"""
    test_data_path = Path(__file__).parent / "fixtures" / "test_data"
    test_data_path.mkdir(parents=True, exist_ok=True)
    return test_data_path


# Audio test fixtures
@pytest.fixture
def sample_audio_file(temp_dir):
    """Create a sample WAV file for testing"""
    sample_rate = 22050
    duration = 2.0  # 2 seconds
    frequency = 440  # A4 note
    
    t = torch.linspace(0, duration, int(sample_rate * duration))
    waveform = torch.sin(2 * torch.pi * frequency * t).unsqueeze(0)
    
    audio_path = temp_dir / "sample_audio.wav"
    torchaudio.save(str(audio_path), waveform, sample_rate)
    
    return str(audio_path)


@pytest.fixture
def long_audio_file(temp_dir):
    """Create a longer audio file for performance testing"""
    sample_rate = 22050
    duration = 30.0  # 30 seconds
    frequency = 440
    
    t = torch.linspace(0, duration, int(sample_rate * duration))
    waveform = torch.sin(2 * torch.pi * frequency * t).unsqueeze(0)
    
    audio_path = temp_dir / "long_audio.wav"
    torchaudio.save(str(audio_path), waveform, sample_rate)
    
    return str(audio_path)


@pytest.fixture
def corrupted_audio_file(temp_dir):
    """Create a corrupted audio file for error testing"""
    corrupted_path = temp_dir / "corrupted.wav"
    with open(corrupted_path, "wb") as f:
        f.write(b"not_an_audio_file_content")
    return str(corrupted_path)


@pytest.fixture
def voice_embedding_sample():
    """Create sample voice embedding for testing"""
    return np.random.rand(512).astype(np.float32)


# Database fixtures
@pytest.fixture
def mock_database():
    """Mock database for testing"""
    db = Mock()
    db.create_audio_session = Mock(return_value="test_session_id")
    db.update_audio_session = Mock()
    db.get_audio_session = Mock()
    db.delete_audio_session = Mock()
    db.create_voice_clone = Mock(return_value="test_clone_id")
    db.get_voice_clone = Mock()
    db.list_voice_clones = Mock(return_value=[])
    db.delete_voice_clone = Mock(return_value=True)
    return db


@pytest.fixture
def mock_vector_store():
    """Mock vector store for testing"""
    vector_store = Mock()
    vector_store.add = Mock()
    vector_store.query = Mock(return_value={
        'ids': [['test_id_1', 'test_id_2']],
        'distances': [[0.1, 0.2]],
        'metadatas': [[{'name': 'test1'}, {'name': 'test2'}]]
    })
    vector_store.delete = Mock()
    return vector_store


# Service fixtures
@pytest.fixture
def mock_stt_service():
    """Mock STT service"""
    service = Mock()
    service.transcribe_audio = Mock(return_value={
        'transcription': 'Hello, this is a test transcription.',
        'language': 'en',
        'confidence': 0.95,
        'audio_duration': 2.0,
        'model': 'whisper-large-v3-turbo'
    })
    service.transcribe_with_timestamps = Mock(return_value={
        'transcription': 'Hello, this is a test transcription.',
        'language': 'en',
        'segments': [
            {'start': 0.0, 'end': 1.0, 'text': 'Hello, this is'},
            {'start': 1.0, 'end': 2.0, 'text': 'a test transcription.'}
        ],
        'model': 'whisper-large-v3-turbo'
    })
    service.detect_language = Mock(return_value='en')
    return service


@pytest.fixture
def mock_tts_service():
    """Mock TTS service"""
    service = Mock()
    service.synthesize_speech = Mock(return_value={
        'audio_path': '/test/path/synthesized.wav',
        'filename': 'synthesized.wav',
        'text': 'Test text to synthesize',
        'language': 'en',
        'voice_style': 'neutral',
        'emotion': 'neutral',
        'duration_seconds': 2.5,
        'sample_rate': 22050,
        'model': 'dia-tts',
        'encrypted': False
    })
    service.get_available_voices = Mock(return_value={
        'voice_styles': ['neutral', 'professional', 'casual'],
        'emotions': ['neutral', 'happy', 'sad', 'angry'],
        'languages': ['en', 'es', 'fr', 'de']
    })
    return service


@pytest.fixture
def mock_voice_cloning_service():
    """Mock voice cloning service"""
    service = Mock()
    service.create_voice_clone = Mock(return_value={
        'clone_id': 'test_clone_123',
        'name': 'Test Voice Clone',
        'status': 'completed',
        'embedding_path': '/test/embeddings/test_clone_123.npy',
        'embedding_dimensions': 512,
        'sample_path': '/test/samples/test_clone_123.wav'
    })
    service.synthesize_with_cloned_voice = Mock(return_value={
        'audio_path': '/test/cloned/output.wav',
        'clone_id': 'test_clone_123',
        'text': 'Test text with cloned voice',
        'language': 'en',
        'duration': 3.0,
        'sample_rate': 22050
    })
    service.list_voice_clones = Mock(return_value=[{
        'clone_id': 'test_clone_123',
        'name': 'Test Voice Clone',
        'created_at': datetime.now(),
        'status': 'completed'
    }])
    service.delete_voice_clone = Mock(return_value=True)
    service.extract_voice_embedding = Mock(return_value=np.random.rand(512))
    service.find_similar_voices = Mock(return_value={
        'ids': ['similar_1', 'similar_2'],
        'distances': [0.1, 0.2],
        'metadatas': [{'name': 'Similar Voice 1'}, {'name': 'Similar Voice 2'}]
    })
    return service


@pytest.fixture
def mock_file_handler():
    """Mock file handler service"""
    handler = Mock()
    handler.save_upload_file = AsyncMock(return_value={
        'filename': 'test_upload.wav',
        'file_path': '/test/uploads/test_upload.wav',
        'original_filename': 'original.wav',
        'file_size': 1024,
        'content_type': 'audio/wav'
    })
    handler.delete_file = Mock(return_value=True)
    handler.get_file_content = Mock(return_value=b'mock_audio_content')
    handler.cleanup_old_files = Mock(return_value=5)
    handler.audio_output_folder = Path('/test/audio_output')
    return handler


@pytest.fixture
def mock_encryption():
    """Mock encryption service"""
    encryption = Mock()
    encryption.encrypt_file = Mock(return_value='/test/encrypted/file.enc')
    encryption.decrypt_file = Mock(return_value='/test/decrypted/file.wav')
    encryption.encrypt_data = Mock(return_value=b'encrypted_data')
    encryption.decrypt_data = Mock(return_value=b'original_data')
    return encryption


# Request/Response fixtures
@pytest.fixture
def sample_transcription_request():
    """Sample transcription request data"""
    return {
        'language': 'en',
        'task': 'transcribe'
    }


@pytest.fixture
def sample_synthesis_request():
    """Sample TTS synthesis request"""
    return {
        'text': 'Hello, this is a test synthesis.',
        'language': 'en',
        'voice_style': 'neutral',
        'emotion': 'neutral',
        'speed': 1.0,
        'pitch': 1.0
    }


@pytest.fixture
def sample_voice_clone_request():
    """Sample voice clone creation request"""
    return {
        'name': 'Test Voice Clone',
        'user_id': 'test_user_123'
    }


@pytest.fixture
def sample_voice_synthesis_request():
    """Sample voice synthesis with cloned voice request"""
    return {
        'text': 'Hello from the cloned voice!',
        'clone_id': 'test_clone_123',
        'language': 'en'
    }


# Performance testing fixtures
@pytest.fixture
def performance_test_files(temp_dir):
    """Create multiple test files for performance testing"""
    files = []
    for i in range(10):
        audio_path = temp_dir / f"perf_test_{i}.wav"
        # Create small test audio file
        sample_rate = 22050
        duration = 1.0
        t = torch.linspace(0, duration, int(sample_rate * duration))
        waveform = torch.sin(2 * torch.pi * 440 * t).unsqueeze(0)
        torchaudio.save(str(audio_path), waveform, sample_rate)
        files.append(str(audio_path))
    return files


# WebSocket fixtures
@pytest.fixture
def mock_websocket():
    """Mock WebSocket connection for streaming tests"""
    websocket = Mock()
    websocket.accept = AsyncMock()
    websocket.send_text = AsyncMock()
    websocket.send_bytes = AsyncMock()
    websocket.receive_text = AsyncMock(return_value='test message')
    websocket.receive_bytes = AsyncMock(return_value=b'test bytes')
    websocket.close = AsyncMock()
    return websocket


# Error simulation fixtures
@pytest.fixture
def file_system_error():
    """Simulate file system errors"""
    def _raise_error(*args, **kwargs):
        raise OSError("Simulated file system error")
    return _raise_error


@pytest.fixture
def memory_error():
    """Simulate memory errors"""
    def _raise_error(*args, **kwargs):
        raise MemoryError("Simulated memory error")
    return _raise_error


@pytest.fixture
def model_loading_error():
    """Simulate model loading errors"""
    def _raise_error(*args, **kwargs):
        raise RuntimeError("Simulated model loading error")
    return _raise_error


# Security testing fixtures
@pytest.fixture
def malicious_file(temp_dir):
    """Create a malicious file for security testing"""
    malicious_path = temp_dir / "malicious.exe"
    with open(malicious_path, "wb") as f:
        f.write(b"MZ\x90\x00")  # PE header signature
    return str(malicious_path)


@pytest.fixture
def oversized_file(temp_dir):
    """Create an oversized file for testing file size limits"""
    oversized_path = temp_dir / "oversized.wav"
    # Create a file that's larger than the expected limit
    with open(oversized_path, "wb") as f:
        f.write(b"0" * (100 * 1024 * 1024))  # 100MB
    return str(oversized_path)


# Session and authentication fixtures
@pytest.fixture
def test_session():
    """Create test session object"""
    return AudioProcessingSession(
        id="test_session_123",
        original_filename="test_audio.wav",
        file_path="/test/path/test_audio.wav",
        file_size=1024,
        transcription="Test transcription",
        duration_seconds=2.0,
        created_at=datetime.now()
    )


@pytest.fixture
def test_voice_clone():
    """Create test voice clone object"""
    return VoiceClone(
        id="test_clone_123",
        name="Test Voice Clone",
        user_id="test_user_123",
        sample_path="/test/samples/clone.wav",
        embedding_path="/test/embeddings/clone.npy",
        status="completed",
        created_at=datetime.now()
    )


# Patch decorators for dependency injection
def patch_dependencies():
    """Decorator to patch all service dependencies"""
    def decorator(func):
        return patch.multiple(
            'app.services',
            get_database=Mock(),
            get_vector_store=Mock(),
            get_stt_service=Mock(),
            get_tts_service=Mock(),
            get_voice_cloning_service=Mock(),
            get_file_handler=Mock(),
            get_encryption=Mock()
        )(func)
    return decorator


# Test data generators
def generate_test_embeddings(n_embeddings=10, dimensions=512):
    """Generate test embeddings for vector store testing"""
    return [np.random.rand(dimensions).astype(np.float32) for _ in range(n_embeddings)]


def generate_test_audio_data(duration=1.0, sample_rate=22050, frequency=440):
    """Generate test audio data"""
    t = torch.linspace(0, duration, int(sample_rate * duration))
    waveform = torch.sin(2 * torch.pi * frequency * t).unsqueeze(0)
    return waveform, sample_rate


# Cleanup utilities
@pytest.fixture(autouse=True)
def cleanup_test_files():
    """Automatically cleanup test files after each test"""
    yield
    # Cleanup logic would go here if needed
    pass