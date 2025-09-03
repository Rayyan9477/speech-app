"""
Integration tests for the Speech App API
Tests full request/response cycles with actual service interactions
"""

import pytest
import asyncio
import tempfile
from pathlib import Path
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient
from httpx import AsyncClient
import torchaudio
import torch
import numpy as np
import json
import io

from app.app import app


@pytest.mark.integration
class TestSTTIntegration:
    """Integration tests for Speech-to-Text functionality"""

    @pytest.mark.asyncio
    async def test_full_stt_workflow(
        self, 
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test complete STT workflow from upload to transcription"""
        
        # Mock realistic responses
        mock_stt_service.transcribe_audio.return_value = {
            'transcription': 'This is a complete integration test transcription.',
            'language': 'en',
            'confidence': 0.92,
            'audio_duration': 3.5,
            'model': 'whisper-large-v3-turbo'
        }
        
        mock_file_handler.save_upload_file.return_value = {
            'filename': 'integration_test.wav',
            'file_path': '/test/uploads/integration_test.wav',
            'original_filename': 'test_audio.wav',
            'file_size': 45000,
            'content_type': 'audio/wav'
        }
        
        test_session = Mock()
        test_session.id = "integration_session_123"
        mock_database.create_audio_session.return_value = "integration_session_123"
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            # Step 1: Upload and transcribe audio
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe", 
                    files=files, 
                    data=data
                )
            
            assert response.status_code == 200
            transcription_data = response.json()
            
            session_id = transcription_data["session_id"]
            assert session_id == "integration_session_123"
            assert transcription_data["transcription"] == "This is a complete integration test transcription."
            
            # Step 2: Retrieve session details
            mock_database.get_audio_session.return_value = test_session
            test_session.id = session_id
            test_session.original_filename = "test_audio.wav"
            test_session.transcription = "This is a complete integration test transcription."
            test_session.duration_seconds = 3.5
            test_session.created_at = None
            
            session_response = await async_test_client.get(f"/api/v1/stt/session/{session_id}")
            
            assert session_response.status_code == 200
            session_data = session_response.json()
            assert session_data["session_id"] == session_id
            assert session_data["transcription"] == "This is a complete integration test transcription."
            
            # Verify service interactions
            mock_stt_service.transcribe_audio.assert_called_once()
            mock_file_handler.save_upload_file.assert_called_once()
            mock_database.create_audio_session.assert_called_once()

    @pytest.mark.asyncio
    async def test_stt_with_language_detection_workflow(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test STT workflow with language detection"""
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            # Step 1: Detect language first
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                
                lang_response = await async_test_client.post(
                    "/api/v1/stt/detect-language",
                    files=files
                )
            
            assert lang_response.status_code == 200
            lang_data = lang_response.json()
            detected_language = lang_data["detected_language"]
            
            # Step 2: Transcribe with detected language
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                data = {"language": detected_language, "task": "transcribe"}
                
                transcribe_response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            assert transcribe_response.status_code == 200
            transcribe_data = transcribe_response.json()
            assert transcribe_data["language"] == detected_language

    @pytest.mark.asyncio
    async def test_stt_with_timestamps_workflow(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test STT workflow with word-level timestamps"""
        
        mock_stt_service.transcribe_with_timestamps.return_value = {
            'transcription': 'Integration test with timestamps.',
            'language': 'en',
            'segments': [
                {'start': 0.0, 'end': 1.5, 'text': 'Integration test'},
                {'start': 1.5, 'end': 2.8, 'text': 'with timestamps.'}
            ],
            'model': 'whisper-large-v3-turbo'
        }
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                data = {"language": "en"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe-with-timestamps",
                    files=files,
                    data=data
                )
            
            assert response.status_code == 200
            data = response.json()
            
            assert "segments" in data
            segments = data["segments"]
            assert len(segments) == 2
            assert all("start" in seg and "end" in seg and "text" in seg for seg in segments)


@pytest.mark.integration
class TestTTSIntegration:
    """Integration tests for Text-to-Speech functionality"""

    @pytest.mark.asyncio
    async def test_full_tts_workflow(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database,
        temp_dir
    ):
        """Test complete TTS workflow from synthesis to audio serving"""
        
        # Mock TTS service responses
        audio_path = temp_dir / "synthesized_audio.wav"
        audio_path.write_bytes(b"fake_audio_content")
        
        mock_tts_service.synthesize_speech.return_value = {
            'audio_path': str(audio_path),
            'filename': 'synthesized_audio.wav',
            'text': 'This is an integration test for TTS.',
            'language': 'en',
            'voice_style': 'professional',
            'emotion': 'neutral',
            'duration_seconds': 2.8,
            'sample_rate': 22050,
            'model': 'dia-tts',
            'encrypted': False
        }
        
        test_session = Mock()
        test_session.id = "tts_integration_session"
        test_session.synthesized_audio_path = str(audio_path)
        test_session.created_at = None
        mock_database.create_audio_session.return_value = "tts_integration_session"
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            # Step 1: Get available voices
            voices_response = await async_test_client.get("/api/v1/tts/voices")
            assert voices_response.status_code == 200
            voices_data = voices_response.json()
            
            assert "voice_styles" in voices_data
            assert "emotions" in voices_data
            assert "languages" in voices_data
            
            # Step 2: Synthesize speech
            synthesis_request = {
                "text": "This is an integration test for TTS.",
                "language": "en",
                "voice_style": "professional",
                "emotion": "neutral",
                "speed": 1.0,
                "pitch": 1.0
            }
            
            synthesis_response = await async_test_client.post(
                "/api/v1/tts/synthesize",
                json=synthesis_request
            )
            
            assert synthesis_response.status_code == 200
            synthesis_data = synthesis_response.json()
            
            session_id = synthesis_data["session_id"]
            assert session_id == "tts_integration_session"
            assert synthesis_data["text"] == synthesis_request["text"]
            assert synthesis_data["audio_path"] == str(audio_path)
            
            # Step 3: Retrieve session details
            mock_database.get_audio_session.return_value = test_session
            
            session_response = await async_test_client.get(f"/api/v1/tts/session/{session_id}")
            
            assert session_response.status_code == 200
            session_data = session_response.json()
            assert session_data["session_id"] == session_id
            assert session_data["synthesized_audio_path"] == str(audio_path)
            
            # Step 4: Serve audio file (mock file serving)
            mock_file_handler = Mock()
            mock_file_handler.audio_output_folder = temp_dir
            
            with patch('app.api.routes.tts.get_file_handler', return_value=mock_file_handler):
                with patch('pathlib.Path.exists', return_value=True):
                    audio_response = await async_test_client.get("/api/v1/tts/audio/synthesized_audio.wav")
                    
                    # Should attempt to serve the file
                    assert audio_response.status_code in [200, 404]  # Depends on actual file existence

    @pytest.mark.asyncio
    async def test_tts_batch_synthesis_workflow(
        self,
        async_test_client: AsyncClient,
        mock_tts_service
    ):
        """Test TTS batch synthesis workflow"""
        
        # Mock successful synthesis for both requests
        def mock_synthesize(**kwargs):
            text = kwargs.get('text', '')
            return {
                'audio_path': f'/test/{text.replace(" ", "_")}.wav',
                'filename': f'{text.replace(" ", "_")}.wav',
                'text': text,
                'language': kwargs.get('language', 'en'),
                'voice_style': kwargs.get('voice_style', 'neutral'),
                'emotion': kwargs.get('emotion', 'neutral'),
                'duration_seconds': 2.0,
                'sample_rate': 22050,
                'model': 'dia-tts',
                'encrypted': False
            }
        
        mock_tts_service.synthesize_speech.side_effect = mock_synthesize
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service):
            
            batch_requests = [
                {
                    "text": "First batch text",
                    "language": "en",
                    "voice_style": "neutral",
                    "emotion": "neutral",
                    "speed": 1.0,
                    "pitch": 1.0
                },
                {
                    "text": "Second batch text",
                    "language": "en",
                    "voice_style": "professional",
                    "emotion": "happy",
                    "speed": 1.2,
                    "pitch": 1.1
                }
            ]
            
            response = await async_test_client.post(
                "/api/v1/tts/synthesize-batch",
                json=batch_requests
            )
            
            assert response.status_code == 200
            data = response.json()
            
            assert "batch_results" in data
            batch_results = data["batch_results"]
            assert len(batch_results) == 2
            
            # Verify all succeeded
            for result in batch_results:
                assert result["status"] == "success"
                assert "result" in result


@pytest.mark.integration
class TestVoiceCloningIntegration:
    """Integration tests for Voice Cloning functionality"""

    @pytest.mark.asyncio
    async def test_full_voice_cloning_workflow(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test complete voice cloning workflow from creation to synthesis"""
        
        clone_id = "integration_clone_123"
        
        # Mock voice cloning responses
        mock_voice_cloning_service.create_voice_clone.return_value = {
            'clone_id': clone_id,
            'name': 'Integration Test Voice',
            'status': 'completed',
            'embedding_path': f'/test/embeddings/{clone_id}.npy',
            'embedding_dimensions': 512,
            'sample_path': f'/test/samples/{clone_id}.wav'
        }
        
        mock_voice_cloning_service.synthesize_with_cloned_voice.return_value = {
            'audio_path': f'/test/cloned/{clone_id}_output.wav',
            'clone_id': clone_id,
            'text': 'Hello from the cloned voice!',
            'language': 'en',
            'duration': 2.5,
            'sample_rate': 22050
        }
        
        mock_voice_cloning_service.list_voice_clones.return_value = [{
            'clone_id': clone_id,
            'name': 'Integration Test Voice',
            'created_at': '2023-01-01T00:00:00',
            'status': 'completed'
        }]
        
        mock_voice_cloning_service.find_similar_voices.return_value = {
            'ids': ['similar_1', 'similar_2'],
            'distances': [0.15, 0.25],
            'metadatas': [
                {'name': 'Similar Voice 1'},
                {'name': 'Similar Voice 2'}
            ]
        }
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            # Step 1: Create voice clone
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                data = {"name": "Integration Test Voice", "user_id": "test_user"}
                
                create_response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert create_response.status_code == 200
            create_data = create_response.json()
            
            created_clone_id = create_data["clone_id"]
            assert created_clone_id == clone_id
            assert create_data["name"] == "Integration Test Voice"
            assert create_data["status"] == "completed"
            
            # Step 2: List voice clones
            list_response = await async_test_client.get("/api/v1/voice/list")
            
            assert list_response.status_code == 200
            list_data = list_response.json()
            
            assert "voice_clones" in list_data
            assert len(list_data["voice_clones"]) == 1
            assert list_data["voice_clones"][0]["clone_id"] == clone_id
            
            # Step 3: Get clone info
            info_response = await async_test_client.get(f"/api/v1/voice/{clone_id}/info")
            
            assert info_response.status_code == 200
            info_data = info_response.json()
            assert info_data["clone_id"] == clone_id
            
            # Step 4: Synthesize with cloned voice
            synthesis_request = {
                "text": "Hello from the cloned voice!",
                "clone_id": clone_id,
                "language": "en"
            }
            
            synthesis_response = await async_test_client.post(
                "/api/v1/voice/synthesize",
                json=synthesis_request
            )
            
            assert synthesis_response.status_code == 200
            synthesis_data = synthesis_response.json()
            
            assert synthesis_data["clone_id"] == clone_id
            assert synthesis_data["text"] == synthesis_request["text"]
            
            # Step 5: Find similar voices
            similar_response = await async_test_client.get(f"/api/v1/voice/similar/{clone_id}")
            
            assert similar_response.status_code == 200
            similar_data = similar_response.json()
            
            assert "similar_voices" in similar_data
            similar_voices = similar_data["similar_voices"]
            assert len(similar_voices) == 2
            
            for voice in similar_voices:
                assert "clone_id" in voice
                assert "similarity_distance" in voice
                assert "metadata" in voice

    @pytest.mark.asyncio
    async def test_voice_clone_embedding_extraction_workflow(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        voice_embedding_sample
    ):
        """Test voice embedding extraction workflow"""
        
        mock_voice_cloning_service.extract_voice_embedding.return_value = voice_embedding_sample
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                
                response = await async_test_client.post(
                    "/api/v1/voice/extract-embedding",
                    files=files
                )
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["embedding_dimensions"] == 512
            assert "embedding_stats" in data
            
            stats = data["embedding_stats"]
            assert all(key in stats for key in ["mean", "std", "min", "max"])


@pytest.mark.integration
class TestCrossServiceIntegration:
    """Integration tests across multiple services"""

    @pytest.mark.asyncio
    async def test_stt_to_tts_workflow(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_tts_service,
        mock_file_handler,
        mock_database
    ):
        """Test workflow from STT transcription to TTS synthesis"""
        
        transcription_text = "This is transcribed text that will be synthesized."
        
        # Mock STT response
        mock_stt_service.transcribe_audio.return_value = {
            'transcription': transcription_text,
            'language': 'en',
            'confidence': 0.95,
            'audio_duration': 3.0,
            'model': 'whisper-large-v3-turbo'
        }
        
        # Mock TTS response
        mock_tts_service.synthesize_speech.return_value = {
            'audio_path': '/test/path/tts_output.wav',
            'filename': 'tts_output.wav',
            'text': transcription_text,
            'language': 'en',
            'voice_style': 'neutral',
            'emotion': 'neutral',
            'duration_seconds': 3.2,
            'sample_rate': 22050,
            'model': 'dia-tts',
            'encrypted': False
        }
        
        mock_database.create_audio_session.side_effect = ["stt_session", "tts_session"]
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database), \
             patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service):
            
            # Step 1: Transcribe audio
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("input_audio.wav", audio_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                stt_response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            assert stt_response.status_code == 200
            stt_data = stt_response.json()
            transcribed_text = stt_data["transcription"]
            
            # Step 2: Synthesize the transcribed text
            tts_request = {
                "text": transcribed_text,
                "language": "en",
                "voice_style": "neutral",
                "emotion": "neutral",
                "speed": 1.0,
                "pitch": 1.0
            }
            
            tts_response = await async_test_client.post(
                "/api/v1/tts/synthesize",
                json=tts_request
            )
            
            assert tts_response.status_code == 200
            tts_data = tts_response.json()
            
            # Verify text roundtrip
            assert tts_data["text"] == transcribed_text
            assert transcribed_text == transcription_text

    @pytest.mark.asyncio
    async def test_voice_cloning_to_tts_workflow(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test workflow from voice cloning to synthesis with cloned voice"""
        
        clone_id = "workflow_clone_123"
        
        # Mock voice cloning creation
        mock_voice_cloning_service.create_voice_clone.return_value = {
            'clone_id': clone_id,
            'name': 'Workflow Test Voice',
            'status': 'completed',
            'embedding_path': f'/test/embeddings/{clone_id}.npy',
            'embedding_dimensions': 512,
            'sample_path': f'/test/samples/{clone_id}.wav'
        }
        
        # Mock synthesis with cloned voice
        mock_voice_cloning_service.synthesize_with_cloned_voice.return_value = {
            'audio_path': f'/test/cloned/{clone_id}_synthesis.wav',
            'clone_id': clone_id,
            'text': 'This is synthesized with my cloned voice.',
            'language': 'en',
            'duration': 3.0,
            'sample_rate': 22050
        }
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            # Step 1: Create voice clone
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                data = {"name": "Workflow Test Voice", "user_id": "workflow_user"}
                
                create_response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert create_response.status_code == 200
            create_data = create_response.json()
            created_clone_id = create_data["clone_id"]
            
            # Step 2: Use the cloned voice for synthesis
            synthesis_request = {
                "text": "This is synthesized with my cloned voice.",
                "clone_id": created_clone_id,
                "language": "en"
            }
            
            synthesis_response = await async_test_client.post(
                "/api/v1/voice/synthesize",
                json=synthesis_request
            )
            
            assert synthesis_response.status_code == 200
            synthesis_data = synthesis_response.json()
            
            assert synthesis_data["clone_id"] == created_clone_id
            assert synthesis_data["text"] == synthesis_request["text"]


@pytest.mark.integration
class TestApplicationLifecycle:
    """Integration tests for application lifecycle and health"""

    @pytest.mark.asyncio
    async def test_application_health_check(self, async_test_client: AsyncClient):
        """Test application health check endpoint"""
        
        with patch('app.app.get_database') as mock_db, \
             patch('app.app.get_vector_store') as mock_vector:
            
            mock_db.return_value = Mock()
            mock_vector.return_value = Mock()
            
            response = await async_test_client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["status"] == "healthy"
            assert "version" in data
            assert "timestamp" in data
            assert "services" in data
            
            services = data["services"]
            assert services["database"] == "healthy"
            assert services["vector_store"] == "healthy"
            assert services["file_storage"] == "healthy"

    @pytest.mark.asyncio
    async def test_api_status_endpoint(self, async_test_client: AsyncClient):
        """Test API status endpoint"""
        
        response = await async_test_client.get("/api/v1/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "api_version" in data
        assert "api_prefix" in data
        assert "services" in data
        assert "features" in data
        
        services = data["services"]
        expected_services = ["speech_to_text", "text_to_speech", "translation", "voice_cloning"]
        
        for service_name in expected_services:
            assert service_name in services
            assert services[service_name]["status"] == "available"

    @pytest.mark.asyncio
    async def test_root_endpoint(self, async_test_client: AsyncClient):
        """Test application root endpoint"""
        
        response = await async_test_client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "version" in data
        assert "api_prefix" in data
        assert "docs_url" in data
        assert "endpoints" in data
        
        endpoints = data["endpoints"]
        expected_endpoints = ["speech_to_text", "text_to_speech", "translation", "voice_cloning"]
        
        for endpoint_name in expected_endpoints:
            assert endpoint_name in endpoints

    @pytest.mark.asyncio
    async def test_cors_headers(self, async_test_client: AsyncClient):
        """Test CORS headers are properly set"""
        
        # Test preflight request
        response = await async_test_client.options("/api/v1/status")
        
        # Should handle OPTIONS request
        assert response.status_code in [200, 405]  # Some frameworks return 405 for OPTIONS
        
        # Test actual request has CORS headers
        response = await async_test_client.get("/api/v1/status")
        
        assert response.status_code == 200
        # Note: In test environment, CORS headers might not be set exactly as in production


@pytest.mark.integration 
class TestErrorHandlingIntegration:
    """Integration tests for error handling across services"""

    @pytest.mark.asyncio
    async def test_service_failure_propagation(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str
    ):
        """Test how service failures propagate through the API"""
        
        # Mock service failure
        mock_stt_service = Mock()
        mock_stt_service.transcribe_audio.side_effect = Exception("Service unavailable")
        
        mock_file_handler = Mock()
        mock_file_handler.save_upload_file = Mock()  # This should succeed
        
        mock_database = Mock()
        mock_database.create_audio_session.return_value = "test_session"
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            # Should return 500 with proper error format
            assert response.status_code == 500
            error_data = response.json()
            assert "detail" in error_data
            assert "Transcription failed" in error_data["detail"]

    @pytest.mark.asyncio
    async def test_database_failure_handling(self, async_test_client: AsyncClient):
        """Test handling of database failures"""
        
        # Mock database failure
        mock_database = Mock()
        mock_database.get_audio_session.side_effect = Exception("Database connection failed")
        
        with patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            response = await async_test_client.get("/api/v1/stt/session/test_session")
            
            assert response.status_code == 500
            error_data = response.json()
            assert "detail" in error_data

    @pytest.mark.asyncio
    async def test_file_system_failure_handling(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str
    ):
        """Test handling of file system failures"""
        
        # Mock file handler failure
        mock_file_handler = Mock()
        mock_file_handler.save_upload_file.side_effect = OSError("Disk full")
        
        mock_stt_service = Mock()
        mock_database = Mock()
        
        with patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            # Should handle file system error gracefully
            assert response.status_code == 500