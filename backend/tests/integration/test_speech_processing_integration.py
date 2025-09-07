"""
Integration tests for speech processing endpoints.
Tests the complete speech processing pipeline including ML model integration.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import io
import wave
import numpy as np
from pathlib import Path

from app.app import app


class TestSpeechProcessingIntegration:
    """Integration tests for speech processing endpoints."""
    
    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)
    
    @pytest.fixture
    def authenticated_client(self, client):
        """Create authenticated test client."""
        # Register and login a test user
        user_data = {
            "username": "speechuser",
            "email": "speech@example.com",
            "password": "SpeechPassword123!",
            "first_name": "Speech",
            "last_name": "User"
        }
        
        client.post("/api/v1/auth/register", json=user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": user_data["username"],
            "password": user_data["password"]
        })
        
        token = login_response.json()["access_token"]
        client.headers.update({"Authorization": f"Bearer {token}"})
        return client
    
    @pytest.fixture
    def sample_audio_file(self):
        """Create a sample WAV audio file for testing."""
        # Generate a simple sine wave audio file
        sample_rate = 44100
        duration = 2.0  # seconds
        frequency = 440.0  # A4 note
        
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        audio_data = np.sin(frequency * 2 * np.pi * t) * 0.3
        
        # Convert to 16-bit integers
        audio_data = (audio_data * 32767).astype(np.int16)
        
        # Create WAV file in memory
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_data.tobytes())
        
        buffer.seek(0)
        return buffer.getvalue()
    
    @pytest.fixture
    def large_audio_file(self):
        """Create a large audio file for testing file size limits."""
        # Create a 10-minute audio file
        sample_rate = 44100
        duration = 600.0  # 10 minutes
        frequency = 440.0
        
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        audio_data = np.sin(frequency * 2 * np.pi * t) * 0.3
        audio_data = (audio_data * 32767).astype(np.int16)
        
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_data.tobytes())
        
        buffer.seek(0)
        return buffer.getvalue()

    def test_text_to_speech_basic_flow(self, authenticated_client):
        """Test basic text-to-speech functionality."""
        tts_data = {
            "text": "Hello world, this is a test of text to speech functionality.",
            "voice_id": "voice-1",
            "settings": {
                "speed": 1.0,
                "pitch": 1.0,
                "volume": 1.0
            }
        }
        
        with patch('app.services.tts_service.generate_speech') as mock_tts:
            mock_tts.return_value = {
                "audio_url": "/generated/test_audio.wav",
                "duration": 3.5,
                "format": "audio/wav"
            }
            
            response = authenticated_client.post("/api/v1/tts/generate", json=tts_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "audio_url" in data
            assert "duration" in data
            assert data["format"] == "audio/wav"
            
            # Verify the service was called with correct parameters
            mock_tts.assert_called_once()
            call_args = mock_tts.call_args[1]
            assert call_args["text"] == tts_data["text"]
            assert call_args["voice_id"] == tts_data["voice_id"]

    def test_text_to_speech_with_invalid_voice(self, authenticated_client):
        """Test TTS with invalid voice ID."""
        tts_data = {
            "text": "Hello world",
            "voice_id": "invalid-voice-id",
            "settings": {"speed": 1.0, "pitch": 1.0, "volume": 1.0}
        }
        
        response = authenticated_client.post("/api/v1/tts/generate", json=tts_data)
        assert response.status_code == 400
        assert "Invalid voice ID" in response.json()["detail"]

    def test_text_to_speech_empty_text(self, authenticated_client):
        """Test TTS with empty text."""
        tts_data = {
            "text": "",
            "voice_id": "voice-1",
            "settings": {"speed": 1.0, "pitch": 1.0, "volume": 1.0}
        }
        
        response = authenticated_client.post("/api/v1/tts/generate", json=tts_data)
        assert response.status_code == 422

    def test_text_to_speech_long_text(self, authenticated_client):
        """Test TTS with very long text."""
        # Text longer than typical limit
        long_text = "This is a test. " * 1000  # ~16,000 characters
        
        tts_data = {
            "text": long_text,
            "voice_id": "voice-1",
            "settings": {"speed": 1.0, "pitch": 1.0, "volume": 1.0}
        }
        
        response = authenticated_client.post("/api/v1/tts/generate", json=tts_data)
        # Should either succeed or return appropriate error
        assert response.status_code in [200, 400, 413]

    def test_speech_to_text_basic_flow(self, authenticated_client, sample_audio_file):
        """Test basic speech-to-text functionality."""
        files = {"audio_file": ("test.wav", sample_audio_file, "audio/wav")}
        data = {"language": "en-US"}
        
        with patch('app.services.stt_service.transcribe_audio') as mock_stt:
            mock_stt.return_value = {
                "text": "This is a transcription of the audio file.",
                "confidence": 0.95,
                "language_detected": "en-US",
                "duration": 2.0
            }
            
            response = authenticated_client.post("/api/v1/stt/transcribe", files=files, data=data)
            
            assert response.status_code == 200
            data = response.json()
            assert "text" in data
            assert "confidence" in data
            assert data["language_detected"] == "en-US"
            assert data["duration"] == 2.0
            
            mock_stt.assert_called_once()

    def test_speech_to_text_unsupported_format(self, authenticated_client):
        """Test STT with unsupported audio format."""
        # Create fake MP4 file content
        fake_mp4 = b"fake mp4 content"
        files = {"audio_file": ("test.mp4", fake_mp4, "video/mp4")}
        data = {"language": "en-US"}
        
        response = authenticated_client.post("/api/v1/stt/transcribe", files=files, data=data)
        assert response.status_code == 400
        assert "Unsupported audio format" in response.json()["detail"]

    def test_speech_to_text_large_file(self, authenticated_client, large_audio_file):
        """Test STT with large audio file."""
        files = {"audio_file": ("large_test.wav", large_audio_file, "audio/wav")}
        data = {"language": "en-US"}
        
        response = authenticated_client.post("/api/v1/stt/transcribe", files=files, data=data)
        # Should return file size error
        assert response.status_code == 413
        assert "File too large" in response.json()["detail"]

    def test_voice_cloning_upload_flow(self, authenticated_client, sample_audio_file):
        """Test voice cloning audio upload."""
        files = {"audio_files": ("sample1.wav", sample_audio_file, "audio/wav")}
        data = {
            "voice_name": "My Custom Voice",
            "description": "A custom voice for testing"
        }
        
        with patch('app.services.voice_cloning_service.create_voice_model') as mock_clone:
            mock_clone.return_value = {
                "voice_id": "custom-voice-123",
                "status": "processing",
                "estimated_completion": "2024-01-01T12:00:00Z"
            }
            
            response = authenticated_client.post("/api/v1/voice-cloning/upload", 
                                               files=files, data=data)
            
            assert response.status_code == 202
            data = response.json()
            assert "voice_id" in data
            assert data["status"] == "processing"
            
            mock_clone.assert_called_once()

    def test_voice_cloning_insufficient_samples(self, authenticated_client):
        """Test voice cloning with insufficient audio samples."""
        # Very short audio file
        short_audio = b"RIFF" + b"\x00" * 100  # Minimal WAV header + data
        files = {"audio_files": ("short.wav", short_audio, "audio/wav")}
        data = {"voice_name": "Test Voice"}
        
        response = authenticated_client.post("/api/v1/voice-cloning/upload", 
                                           files=files, data=data)
        assert response.status_code == 400
        assert "Insufficient audio" in response.json()["detail"]

    def test_voice_translation_basic_flow(self, authenticated_client, sample_audio_file):
        """Test voice translation functionality."""
        files = {"audio_file": ("test.wav", sample_audio_file, "audio/wav")}
        data = {
            "source_language": "en-US",
            "target_language": "es-ES",
            "target_voice_id": "spanish-voice-1"
        }
        
        with patch('app.services.translation_service.translate_voice') as mock_translate:
            mock_translate.return_value = {
                "translated_audio_url": "/translated/test_audio.wav",
                "original_text": "Hello world",
                "translated_text": "Hola mundo",
                "duration": 2.1,
                "confidence": 0.92
            }
            
            response = authenticated_client.post("/api/v1/translation/voice", 
                                               files=files, data=data)
            
            assert response.status_code == 200
            result = response.json()
            assert "translated_audio_url" in result
            assert "original_text" in result
            assert "translated_text" in result
            assert result["confidence"] == 0.92
            
            mock_translate.assert_called_once()

    def test_voice_translation_unsupported_language_pair(self, authenticated_client, sample_audio_file):
        """Test voice translation with unsupported language pair."""
        files = {"audio_file": ("test.wav", sample_audio_file, "audio/wav")}
        data = {
            "source_language": "en-US",
            "target_language": "fictional-language",
            "target_voice_id": "voice-1"
        }
        
        response = authenticated_client.post("/api/v1/translation/voice", 
                                           files=files, data=data)
        assert response.status_code == 400
        assert "Unsupported language" in response.json()["detail"]

    def test_voice_processing_concurrent_requests(self, authenticated_client, sample_audio_file):
        """Test concurrent voice processing requests."""
        import threading
        import time
        
        results = []
        
        def make_request():
            files = {"audio_file": ("test.wav", sample_audio_file, "audio/wav")}
            data = {"language": "en-US"}
            response = authenticated_client.post("/api/v1/stt/transcribe", files=files, data=data)
            results.append(response.status_code)
        
        # Create multiple threads
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads
        for thread in threads:
            thread.join()
        
        # All requests should succeed or be properly queued
        assert all(status in [200, 202, 429] for status in results)

    def test_voice_processing_rate_limiting(self, authenticated_client, sample_audio_file):
        """Test rate limiting on voice processing endpoints."""
        files = {"audio_file": ("test.wav", sample_audio_file, "audio/wav")}
        data = {"language": "en-US"}
        
        # Make many requests in quick succession
        responses = []
        for _ in range(20):
            response = authenticated_client.post("/api/v1/stt/transcribe", files=files, data=data)
            responses.append(response.status_code)
        
        # Should eventually hit rate limits
        assert any(status == 429 for status in responses)

    def test_audio_format_conversion(self, authenticated_client):
        """Test automatic audio format conversion."""
        # Create a simple MP3-like header (fake)
        fake_mp3 = b"ID3" + b"\x00" * 100
        files = {"audio_file": ("test.mp3", fake_mp3, "audio/mpeg")}
        data = {"language": "en-US"}
        
        with patch('app.services.audio_processing.convert_audio_format') as mock_convert:
            mock_convert.return_value = b"converted_wav_content"
            
            response = authenticated_client.post("/api/v1/stt/transcribe", files=files, data=data)
            
            # Should attempt conversion
            mock_convert.assert_called_once()

    def test_voice_model_management(self, authenticated_client):
        """Test voice model listing and management."""
        # List available voices
        response = authenticated_client.get("/api/v1/voices/list")
        assert response.status_code == 200
        
        voices = response.json()
        assert isinstance(voices, list)
        
        # Each voice should have required fields
        if voices:
            voice = voices[0]
            required_fields = ["id", "name", "language", "gender"]
            for field in required_fields:
                assert field in voice

    def test_voice_sample_playback(self, authenticated_client):
        """Test voice sample playback endpoint."""
        voice_id = "voice-1"
        
        with patch('app.services.voice_service.get_voice_sample') as mock_sample:
            mock_sample.return_value = {
                "sample_url": f"/samples/{voice_id}_sample.wav",
                "duration": 3.0
            }
            
            response = authenticated_client.get(f"/api/v1/voices/{voice_id}/sample")
            
            assert response.status_code == 200
            data = response.json()
            assert "sample_url" in data
            assert "duration" in data

    def test_processing_job_status_tracking(self, authenticated_client, sample_audio_file):
        """Test processing job status tracking."""
        # Start a voice cloning job
        files = {"audio_files": ("sample.wav", sample_audio_file, "audio/wav")}
        data = {"voice_name": "Test Voice"}
        
        with patch('app.services.voice_cloning_service.create_voice_model') as mock_clone:
            mock_clone.return_value = {
                "voice_id": "voice-123",
                "job_id": "job-456",
                "status": "processing"
            }
            
            response = authenticated_client.post("/api/v1/voice-cloning/upload", 
                                               files=files, data=data)
            
            assert response.status_code == 202
            job_id = response.json()["job_id"]
            
            # Check job status
            with patch('app.services.job_service.get_job_status') as mock_status:
                mock_status.return_value = {
                    "job_id": job_id,
                    "status": "completed",
                    "progress": 100,
                    "result": {"voice_id": "voice-123"}
                }
                
                status_response = authenticated_client.get(f"/api/v1/jobs/{job_id}/status")
                assert status_response.status_code == 200
                
                status_data = status_response.json()
                assert status_data["status"] == "completed"
                assert status_data["progress"] == 100

    def test_error_handling_model_failure(self, authenticated_client):
        """Test error handling when ML models fail."""
        tts_data = {
            "text": "Test text",
            "voice_id": "voice-1",
            "settings": {"speed": 1.0, "pitch": 1.0, "volume": 1.0}
        }
        
        with patch('app.services.tts_service.generate_speech') as mock_tts:
            mock_tts.side_effect = Exception("Model inference failed")
            
            response = authenticated_client.post("/api/v1/tts/generate", json=tts_data)
            
            assert response.status_code == 500
            assert "processing error" in response.json()["detail"].lower()

    def test_audio_quality_validation(self, authenticated_client):
        """Test audio quality validation for voice cloning."""
        # Low quality audio (very low sample rate simulation)
        low_quality_audio = b"RIFF" + b"\x00" * 1000
        files = {"audio_files": ("low_quality.wav", low_quality_audio, "audio/wav")}
        data = {"voice_name": "Test Voice"}
        
        response = authenticated_client.post("/api/v1/voice-cloning/upload", 
                                           files=files, data=data)
        
        # Should reject low quality audio
        assert response.status_code == 400
        assert "audio quality" in response.json()["detail"].lower()

    def test_streaming_audio_processing(self, authenticated_client):
        """Test streaming audio processing capabilities."""
        # Test streaming STT endpoint if available
        response = authenticated_client.get("/api/v1/stt/stream")
        
        # Should either support streaming or return not implemented
        assert response.status_code in [200, 501]

    def test_batch_processing(self, authenticated_client, sample_audio_file):
        """Test batch processing of multiple audio files."""
        files = [
            ("audio_files", ("test1.wav", sample_audio_file, "audio/wav")),
            ("audio_files", ("test2.wav", sample_audio_file, "audio/wav"))
        ]
        data = {"language": "en-US"}
        
        response = authenticated_client.post("/api/v1/stt/batch", files=files, data=data)
        
        # Should either support batch processing or return not implemented
        assert response.status_code in [200, 202, 501]

    def test_audio_preprocessing(self, authenticated_client, sample_audio_file):
        """Test audio preprocessing (noise reduction, normalization)."""
        files = {"audio_file": ("noisy_test.wav", sample_audio_file, "audio/wav")}
        data = {
            "language": "en-US",
            "preprocessing": {
                "noise_reduction": True,
                "normalization": True,
                "silence_removal": True
            }
        }
        
        with patch('app.services.audio_preprocessing.process_audio') as mock_preprocess:
            mock_preprocess.return_value = sample_audio_file  # Return processed audio
            
            response = authenticated_client.post("/api/v1/stt/transcribe", 
                                               files=files, data=data)
            
            # Should apply preprocessing
            if response.status_code == 200:
                mock_preprocess.assert_called_once()

    def test_custom_model_integration(self, authenticated_client):
        """Test integration with custom trained models."""
        # Test endpoint for using custom models
        model_data = {
            "text": "Test with custom model",
            "voice_id": "custom-voice-123",  # User's custom voice
            "settings": {"speed": 1.0, "pitch": 1.0, "volume": 1.0}
        }
        
        response = authenticated_client.post("/api/v1/tts/generate", json=model_data)
        
        # Should either work with custom model or return appropriate error
        assert response.status_code in [200, 404]

    def test_model_performance_monitoring(self, authenticated_client, sample_audio_file):
        """Test model performance monitoring."""
        files = {"audio_file": ("test.wav", sample_audio_file, "audio/wav")}
        data = {"language": "en-US"}
        
        with patch('app.services.monitoring.log_model_performance') as mock_monitor:
            response = authenticated_client.post("/api/v1/stt/transcribe", files=files, data=data)
            
            # Should log performance metrics
            if response.status_code == 200:
                mock_monitor.assert_called_once()

    def test_unauthorized_access_to_processing_endpoints(self, client, sample_audio_file):
        """Test unauthorized access to processing endpoints."""
        endpoints = [
            ("/api/v1/tts/generate", "post", {"text": "test", "voice_id": "voice-1"}),
            ("/api/v1/stt/transcribe", "post", {}),
            ("/api/v1/voice-cloning/upload", "post", {}),
            ("/api/v1/translation/voice", "post", {}),
        ]
        
        for endpoint, method, data in endpoints:
            if method == "post" and "transcribe" in endpoint:
                files = {"audio_file": ("test.wav", sample_audio_file, "audio/wav")}
                response = getattr(client, method)(endpoint, files=files, data=data)
            else:
                response = getattr(client, method)(endpoint, json=data)
            
            assert response.status_code in [401, 403]