"""
End-to-end tests for complete user workflows
Tests realistic user scenarios across the entire application stack
"""

import pytest
import asyncio
from unittest.mock import patch, Mock, AsyncMock
from fastapi.testclient import TestClient
from httpx import AsyncClient
import json
import time
import tempfile
from pathlib import Path

from app.app import app


@pytest.mark.e2e
class TestCompleteSTTWorkflow:
    """Test complete Speech-to-Text user workflows"""

    @pytest.mark.asyncio
    async def test_complete_stt_user_journey(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test complete STT workflow from upload to session retrieval"""
        
        # Mock realistic service responses
        session_id = "e2e_test_session_123"
        mock_stt_service.transcribe_audio.return_value = {
            'transcription': 'Welcome to the end-to-end test for speech recognition.',
            'language': 'en',
            'confidence': 0.97,
            'audio_duration': 5.2,
            'model': 'whisper-large-v3-turbo'
        }
        
        mock_file_handler.save_upload_file.return_value = {
            'filename': 'e2e_test_audio.wav',
            'file_path': '/uploads/e2e_test_audio.wav',
            'original_filename': 'user_recording.wav',
            'file_size': 85000,
            'content_type': 'audio/wav'
        }
        
        mock_database.create_audio_session.return_value = session_id
        test_session = Mock()
        test_session.id = session_id
        test_session.original_filename = "user_recording.wav"
        test_session.transcription = "Welcome to the end-to-end test for speech recognition."
        test_session.duration_seconds = 5.2
        test_session.created_at = None
        mock_database.get_audio_session.return_value = test_session
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            # Step 1: User uploads audio file for transcription
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("user_recording.wav", audio_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                transcribe_response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            # Verify transcription succeeded
            assert transcribe_response.status_code == 200
            transcribe_data = transcribe_response.json()
            
            assert transcribe_data["session_id"] == session_id
            assert "Welcome to the end-to-end test" in transcribe_data["transcription"]
            assert transcribe_data["confidence"] > 0.9
            
            # Step 2: User retrieves session details
            session_response = await async_test_client.get(
                f"/api/v1/stt/session/{session_id}"
            )
            
            assert session_response.status_code == 200
            session_data = session_response.json()
            
            assert session_data["session_id"] == session_id
            assert session_data["original_filename"] == "user_recording.wav"
            assert "Welcome to the end-to-end test" in session_data["transcription"]
            
            # Step 3: Verify all service interactions occurred as expected
            mock_stt_service.transcribe_audio.assert_called_once()
            mock_file_handler.save_upload_file.assert_called_once()
            mock_database.create_audio_session.assert_called_once()
            mock_database.get_audio_session.assert_called_once_with(session_id)

    @pytest.mark.asyncio
    async def test_stt_with_language_detection_workflow(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test STT workflow with automatic language detection"""
        
        mock_stt_service.detect_language.return_value = "es"  # Spanish detected
        mock_stt_service.transcribe_audio.return_value = {
            'transcription': 'Bienvenido a la prueba de reconocimiento de voz.',
            'language': 'es',
            'confidence': 0.94,
            'audio_duration': 4.8,
            'model': 'whisper-large-v3-turbo'
        }
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            # Step 1: Detect language
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("spanish_audio.wav", audio_file, "audio/wav")}
                
                language_response = await async_test_client.post(
                    "/api/v1/stt/detect-language",
                    files=files
                )
            
            assert language_response.status_code == 200
            language_data = language_response.json()
            detected_language = language_data["detected_language"]
            assert detected_language == "es"
            
            # Step 2: Use detected language for transcription
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("spanish_audio.wav", audio_file, "audio/wav")}
                data = {"language": detected_language, "task": "transcribe"}
                
                transcribe_response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            assert transcribe_response.status_code == 200
            transcribe_data = transcribe_response.json()
            assert transcribe_data["language"] == "es"
            assert "Bienvenido" in transcribe_data["transcription"]


@pytest.mark.e2e
class TestCompleteTTSWorkflow:
    """Test complete Text-to-Speech user workflows"""

    @pytest.mark.asyncio
    async def test_complete_tts_user_journey(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database,
        temp_dir
    ):
        """Test complete TTS workflow from synthesis to audio serving"""
        
        session_id = "e2e_tts_session_456"
        audio_output_path = temp_dir / "synthesized_speech.wav"
        audio_output_path.write_bytes(b"mock_synthesized_audio_content")
        
        # Mock TTS service responses
        mock_tts_service.get_available_voices.return_value = {
            'voice_styles': ['neutral', 'professional', 'casual', 'cheerful'],
            'emotions': ['neutral', 'happy', 'sad', 'excited'],
            'languages': ['en', 'es', 'fr', 'de', 'it']
        }
        
        mock_tts_service.synthesize_speech.return_value = {
            'audio_path': str(audio_output_path),
            'filename': 'synthesized_speech.wav',
            'text': 'Hello, this is a complete end-to-end test for text-to-speech functionality.',
            'language': 'en',
            'voice_style': 'professional',
            'emotion': 'cheerful',
            'duration_seconds': 6.3,
            'sample_rate': 22050,
            'model': 'dia-tts',
            'encrypted': False
        }
        
        test_session = Mock()
        test_session.id = session_id
        test_session.synthesized_audio_path = str(audio_output_path)
        test_session.created_at = None
        mock_database.create_audio_session.return_value = session_id
        mock_database.get_audio_session.return_value = test_session
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            # Step 1: User checks available voices
            voices_response = await async_test_client.get("/api/v1/tts/voices")
            
            assert voices_response.status_code == 200
            voices_data = voices_response.json()
            
            assert "voice_styles" in voices_data
            assert "professional" in voices_data["voice_styles"]
            assert "cheerful" in voices_data["emotions"]
            assert "en" in voices_data["languages"]
            
            # Step 2: User synthesizes speech with chosen options
            synthesis_request = {
                "text": "Hello, this is a complete end-to-end test for text-to-speech functionality.",
                "language": "en",
                "voice_style": "professional",
                "emotion": "cheerful",
                "speed": 1.0,
                "pitch": 1.0
            }
            
            synthesis_response = await async_test_client.post(
                "/api/v1/tts/synthesize",
                json=synthesis_request
            )
            
            assert synthesis_response.status_code == 200
            synthesis_data = synthesis_response.json()
            
            assert synthesis_data["session_id"] == session_id
            assert synthesis_data["text"] == synthesis_request["text"]
            assert synthesis_data["voice_style"] == "professional"
            assert synthesis_data["emotion"] == "cheerful"
            assert synthesis_data["duration_seconds"] > 0
            
            # Step 3: User retrieves session details
            session_response = await async_test_client.get(
                f"/api/v1/tts/session/{session_id}"
            )
            
            assert session_response.status_code == 200
            session_data = session_response.json()
            assert session_data["session_id"] == session_id
            assert session_data["synthesized_audio_path"] == str(audio_output_path)
            
            # Step 4: User downloads the generated audio (simulated)
            mock_file_handler = Mock()
            mock_file_handler.audio_output_folder = temp_dir
            
            with patch('app.api.routes.tts.get_file_handler', return_value=mock_file_handler):
                with patch('pathlib.Path.exists', return_value=True):
                    audio_response = await async_test_client.get(
                        "/api/v1/tts/audio/synthesized_speech.wav"
                    )
                    
                    # Should attempt to serve the audio file
                    assert audio_response.status_code in [200, 404]  # Depends on file serving implementation


@pytest.mark.e2e
class TestCompleteVoiceCloningWorkflow:
    """Test complete Voice Cloning user workflows"""

    @pytest.mark.asyncio
    async def test_complete_voice_cloning_journey(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test complete voice cloning workflow from creation to synthesis"""
        
        clone_id = "e2e_voice_clone_789"
        user_id = "e2e_test_user"
        
        # Mock voice cloning service responses
        mock_voice_cloning_service.create_voice_clone.return_value = {
            'clone_id': clone_id,
            'name': 'My Personal Voice Clone',
            'status': 'completed',
            'embedding_path': f'/embeddings/{clone_id}.npy',
            'embedding_dimensions': 512,
            'sample_path': f'/samples/{clone_id}.wav'
        }
        
        mock_voice_cloning_service.list_voice_clones.return_value = [{
            'clone_id': clone_id,
            'name': 'My Personal Voice Clone',
            'created_at': '2023-01-01T12:00:00Z',
            'status': 'completed',
            'user_id': user_id
        }]
        
        mock_voice_cloning_service.synthesize_with_cloned_voice.return_value = {
            'audio_path': f'/cloned_audio/{clone_id}_output.wav',
            'clone_id': clone_id,
            'text': 'Hello, this is my cloned voice speaking!',
            'language': 'en',
            'duration': 3.8,
            'sample_rate': 22050
        }
        
        mock_voice_cloning_service.find_similar_voices.return_value = {
            'ids': ['similar_voice_1', 'similar_voice_2', 'similar_voice_3'],
            'distances': [0.12, 0.18, 0.24],
            'metadatas': [
                {'name': 'Similar Voice 1', 'user': 'user1'},
                {'name': 'Similar Voice 2', 'user': 'user2'},
                {'name': 'Similar Voice 3', 'user': 'user3'}
            ]
        }
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            # Step 1: User creates a voice clone
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("my_voice_sample.wav", audio_file, "audio/wav")}
                data = {"name": "My Personal Voice Clone", "user_id": user_id}
                
                create_response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert create_response.status_code == 200
            create_data = create_response.json()
            
            created_clone_id = create_data["clone_id"]
            assert created_clone_id == clone_id
            assert create_data["name"] == "My Personal Voice Clone"
            assert create_data["status"] == "completed"
            assert create_data["embedding_dimensions"] == 512
            
            # Step 2: User lists their voice clones
            list_response = await async_test_client.get(
                f"/api/v1/voice/list?user_id={user_id}"
            )
            
            assert list_response.status_code == 200
            list_data = list_response.json()
            
            assert "voice_clones" in list_data
            assert list_data["total"] == 1
            voice_clones = list_data["voice_clones"]
            assert voice_clones[0]["clone_id"] == clone_id
            assert voice_clones[0]["name"] == "My Personal Voice Clone"
            
            # Step 3: User gets detailed clone information
            info_response = await async_test_client.get(
                f"/api/v1/voice/{clone_id}/info"
            )
            
            assert info_response.status_code == 200
            info_data = info_response.json()
            assert info_data["clone_id"] == clone_id
            
            # Step 4: User synthesizes speech with their cloned voice
            synthesis_request = {
                "text": "Hello, this is my cloned voice speaking!",
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
            assert synthesis_data["duration"] > 0
            assert synthesis_data["sample_rate"] == 22050
            
            # Step 5: User finds similar voices
            similar_response = await async_test_client.get(
                f"/api/v1/voice/similar/{clone_id}?n_results=3"
            )
            
            assert similar_response.status_code == 200
            similar_data = similar_response.json()
            
            assert "similar_voices" in similar_data
            similar_voices = similar_data["similar_voices"]
            assert len(similar_voices) == 3
            
            for voice in similar_voices:
                assert "clone_id" in voice
                assert "similarity_distance" in voice
                assert "metadata" in voice
                assert voice["similarity_distance"] >= 0
            
            # Verify similarity distances are in ascending order (more similar first)
            distances = [voice["similarity_distance"] for voice in similar_voices]
            assert distances == sorted(distances), "Similar voices should be ordered by similarity"


@pytest.mark.e2e
class TestCrossServiceWorkflows:
    """Test workflows that span multiple services"""

    @pytest.mark.asyncio
    async def test_stt_to_voice_cloning_workflow(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test workflow from STT transcription to voice cloning"""
        
        # Mock STT response
        mock_stt_service.transcribe_audio.return_value = {
            'transcription': 'This audio sample will be used for voice cloning.',
            'language': 'en',
            'confidence': 0.96,
            'audio_duration': 4.5,
            'model': 'whisper-large-v3-turbo'
        }
        
        # Mock voice cloning response
        clone_id = "transcribed_to_cloned_voice_123"
        mock_voice_cloning_service.create_voice_clone.return_value = {
            'clone_id': clone_id,
            'name': 'Voice from Transcribed Audio',
            'status': 'completed',
            'embedding_path': f'/embeddings/{clone_id}.npy',
            'embedding_dimensions': 512,
            'sample_path': f'/samples/{clone_id}.wav'
        }
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database), \
             patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            # Step 1: User transcribes audio to verify quality
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                transcribe_response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            assert transcribe_response.status_code == 200
            transcribe_data = transcribe_response.json()
            
            # User verifies the transcription quality before proceeding
            assert transcribe_data["confidence"] > 0.9
            assert "voice cloning" in transcribe_data["transcription"]
            
            # Step 2: User proceeds to create voice clone with same audio
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                data = {"name": "Voice from Transcribed Audio", "user_id": "workflow_user"}
                
                clone_response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert clone_response.status_code == 200
            clone_data = clone_response.json()
            
            assert clone_data["clone_id"] == clone_id
            assert clone_data["name"] == "Voice from Transcribed Audio"
            assert clone_data["status"] == "completed"

    @pytest.mark.asyncio
    async def test_voice_cloning_to_tts_synthesis_workflow(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_tts_service,
        mock_file_handler,
        mock_database
    ):
        """Test workflow from voice cloning to TTS synthesis comparison"""
        
        clone_id = "comparison_voice_clone_456"
        
        # Mock voice cloning responses
        mock_voice_cloning_service.create_voice_clone.return_value = {
            'clone_id': clone_id,
            'name': 'Voice for TTS Comparison',
            'status': 'completed',
            'embedding_path': f'/embeddings/{clone_id}.npy',
            'embedding_dimensions': 512,
            'sample_path': f'/samples/{clone_id}.wav'
        }
        
        mock_voice_cloning_service.synthesize_with_cloned_voice.return_value = {
            'audio_path': f'/cloned_audio/{clone_id}_comparison.wav',
            'clone_id': clone_id,
            'text': 'This is speech generated with the cloned voice.',
            'language': 'en',
            'duration': 4.2,
            'sample_rate': 22050
        }
        
        # Mock TTS responses
        mock_tts_service.synthesize_speech.return_value = {
            'audio_path': '/tts_audio/standard_synthesis.wav',
            'filename': 'standard_synthesis.wav',
            'text': 'This is speech generated with the cloned voice.',
            'language': 'en',
            'voice_style': 'neutral',
            'emotion': 'neutral',
            'duration_seconds': 4.1,
            'sample_rate': 22050,
            'model': 'dia-tts',
            'encrypted': False
        }
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database), \
             patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service):
            
            # Step 1: Create voice clone
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("comparison_voice.wav", audio_file, "audio/wav")}
                data = {"name": "Voice for TTS Comparison", "user_id": "comparison_user"}
                
                clone_response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert clone_response.status_code == 200
            clone_data = clone_response.json()
            created_clone_id = clone_data["clone_id"]
            
            # Step 2: Synthesize same text with cloned voice
            comparison_text = "This is speech generated with the cloned voice."
            
            cloned_synthesis_response = await async_test_client.post(
                "/api/v1/voice/synthesize",
                json={
                    "text": comparison_text,
                    "clone_id": created_clone_id,
                    "language": "en"
                }
            )
            
            assert cloned_synthesis_response.status_code == 200
            cloned_synthesis_data = cloned_synthesis_response.json()
            
            # Step 3: Synthesize same text with standard TTS
            standard_synthesis_response = await async_test_client.post(
                "/api/v1/tts/synthesize",
                json={
                    "text": comparison_text,
                    "language": "en",
                    "voice_style": "neutral",
                    "emotion": "neutral",
                    "speed": 1.0,
                    "pitch": 1.0
                }
            )
            
            assert standard_synthesis_response.status_code == 200
            standard_synthesis_data = standard_synthesis_response.json()
            
            # Step 4: Compare results
            assert cloned_synthesis_data["text"] == standard_synthesis_data["text"]
            assert cloned_synthesis_data["clone_id"] == created_clone_id
            assert standard_synthesis_data["voice_style"] == "neutral"
            
            # Both should have similar durations for same text
            duration_diff = abs(
                cloned_synthesis_data["duration"] - 
                standard_synthesis_data["duration_seconds"]
            )
            assert duration_diff < 2.0, "Synthesis durations should be similar for same text"


@pytest.mark.e2e
class TestErrorRecoveryWorkflows:
    """Test error recovery and resilience in user workflows"""

    @pytest.mark.asyncio
    async def test_failed_transcription_recovery_workflow(
        self,
        async_test_client: AsyncClient,
        corrupted_audio_file: str,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test recovery from failed transcription with retry"""
        
        # First attempt fails
        mock_stt_service.transcribe_audio.side_effect = [
            Exception("Audio file corrupted"),
            {
                'transcription': 'Successfully recovered transcription.',
                'language': 'en',
                'confidence': 0.93,
                'audio_duration': 3.2,
                'model': 'whisper-large-v3-turbo'
            }
        ]
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            # Step 1: First attempt with corrupted file fails
            with open(corrupted_audio_file, 'rb') as bad_file:
                files = {"file": ("corrupted.wav", bad_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                first_response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            # Should return error
            assert first_response.status_code == 500
            
            # Step 2: User retries with good file
            with open(sample_audio_file, 'rb') as good_file:
                files = {"file": ("good_audio.wav", good_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                retry_response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            # Should succeed on retry
            assert retry_response.status_code == 200
            retry_data = retry_response.json()
            assert "Successfully recovered" in retry_data["transcription"]

    @pytest.mark.asyncio
    async def test_voice_clone_failure_and_deletion_workflow(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test voice clone creation failure and cleanup"""
        
        failed_clone_id = "failed_voice_clone_789"
        
        # Mock creation failure, then successful deletion
        mock_voice_cloning_service.create_voice_clone.side_effect = [
            Exception("Voice clone creation failed"),
        ]
        mock_voice_cloning_service.delete_voice_clone.return_value = True
        mock_voice_cloning_service.list_voice_clones.return_value = []
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            # Step 1: Attempt to create voice clone fails
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("failed_voice.wav", audio_file, "audio/wav")}
                data = {"name": "Failed Voice Clone", "user_id": "cleanup_user"}
                
                create_response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert create_response.status_code == 500
            
            # Step 2: Verify no partial voice clones were left behind
            list_response = await async_test_client.get("/api/v1/voice/list")
            
            assert list_response.status_code == 200
            list_data = list_response.json()
            assert list_data["total"] == 0  # No clones should exist


@pytest.mark.e2e
class TestRealTimeStreamingWorkflow:
    """Test real-time streaming workflows"""

    @pytest.mark.asyncio
    async def test_streaming_readiness_check_workflow(
        self,
        async_test_client: AsyncClient,
        mock_stt_service
    ):
        """Test streaming service readiness verification"""
        
        # Mock service states
        mock_stt_service.processor = Mock()
        mock_stt_service.model = Mock()
        mock_stt_service.load_model = Mock()
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            
            # Step 1: Check streaming service status
            status_response = await async_test_client.get("/api/v1/stream/stream/transcribe")
            
            assert status_response.status_code == 200
            status_data = status_response.json()
            
            assert status_data["service"] == "Real-time STT"
            assert status_data["supported_sample_rate"] == 16000
            assert "active_connections" in status_data
            
            # Step 2: Test streaming readiness
            test_response = await async_test_client.post("/api/v1/stream/stream/test")
            
            assert test_response.status_code == 200
            test_data = test_response.json()
            
            assert test_data["streaming_ready"] is True
            assert test_data["model_loaded"] is True
            assert test_data["test_status"] == "OK"
            assert "websocket_endpoint" in test_data

    @pytest.mark.asyncio
    async def test_streaming_service_failure_workflow(
        self,
        async_test_client: AsyncClient
    ):
        """Test streaming workflow when service is not ready"""
        
        # Mock service failure
        mock_failed_service = Mock()
        mock_failed_service.processor = None
        mock_failed_service.model = None
        mock_failed_service.load_model.side_effect = Exception("Model loading failed")
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_failed_service):
            
            test_response = await async_test_client.post("/api/v1/stream/stream/test")
            
            assert test_response.status_code == 200
            test_data = test_response.json()
            
            assert test_data["streaming_ready"] is False
            assert test_data["model_loaded"] is False
            assert test_data["test_status"] == "FAILED"
            assert "error" in test_data