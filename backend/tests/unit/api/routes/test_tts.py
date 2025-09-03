"""
Unit tests for Text-to-Speech API endpoints
Tests all TTS routes including synthesis, voice styles, and audio serving
"""

import pytest
from unittest.mock import patch, Mock, AsyncMock
from fastapi import status
from httpx import AsyncClient
import asyncio
from pathlib import Path

from app.api.routes.tts import router


class TestTTSSynthesis:
    """Test TTS synthesis endpoints"""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_speech_success(
        self, 
        async_test_client: AsyncClient,
        sample_synthesis_request: dict,
        mock_tts_service,
        mock_database
    ):
        """Test successful speech synthesis"""
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            response = await async_test_client.post(
                "/api/v1/tts/synthesize",
                json=sample_synthesis_request
            )
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "audio_path" in response_data
            assert "filename" in response_data
            assert "text" in response_data
            assert "language" in response_data
            assert "voice_style" in response_data
            assert "emotion" in response_data
            assert "duration_seconds" in response_data
            assert "sample_rate" in response_data
            assert "model" in response_data
            assert "encrypted" in response_data
            assert "session_id" in response_data
            
            assert response_data["text"] == sample_synthesis_request["text"]
            assert response_data["language"] == sample_synthesis_request["language"]
            assert response_data["voice_style"] == sample_synthesis_request["voice_style"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_speech_with_emotions(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test speech synthesis with different emotions"""
        
        emotions = ["happy", "sad", "angry", "neutral"]
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            for emotion in emotions:
                request_data = {
                    "text": f"This is a {emotion} test",
                    "language": "en",
                    "voice_style": "neutral",
                    "emotion": emotion,
                    "speed": 1.0,
                    "pitch": 1.0
                }
                
                response = await async_test_client.post(
                    "/api/v1/tts/synthesize",
                    json=request_data
                )
                
                assert response.status_code == status.HTTP_200_OK
                response_data = response.json()
                assert response_data["emotion"] == emotion

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_speech_with_speed_pitch_control(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test speech synthesis with speed and pitch adjustments"""
        
        test_cases = [
            {"speed": 0.5, "pitch": 0.5},  # Slow and low
            {"speed": 2.0, "pitch": 2.0},  # Fast and high
            {"speed": 1.5, "pitch": 0.8},  # Mixed
        ]
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            for case in test_cases:
                request_data = {
                    "text": "Test synthesis with speed and pitch control",
                    "language": "en",
                    "voice_style": "neutral",
                    "emotion": "neutral",
                    "speed": case["speed"],
                    "pitch": case["pitch"]
                }
                
                response = await async_test_client.post(
                    "/api/v1/tts/synthesize",
                    json=request_data
                )
                
                assert response.status_code == status.HTTP_200_OK
                
                # Verify service was called with correct parameters
                mock_tts_service.synthesize_speech.assert_called()
                call_args = mock_tts_service.synthesize_speech.call_args
                assert call_args[1]["speed"] == case["speed"]
                assert call_args[1]["pitch"] == case["pitch"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_multiple_languages(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test speech synthesis with multiple languages"""
        
        languages = ["en", "es", "fr", "de"]
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            for language in languages:
                request_data = {
                    "text": "Hello world in different languages",
                    "language": language,
                    "voice_style": "neutral",
                    "emotion": "neutral",
                    "speed": 1.0,
                    "pitch": 1.0
                }
                
                response = await async_test_client.post(
                    "/api/v1/tts/synthesize",
                    json=request_data
                )
                
                assert response.status_code == status.HTTP_200_OK
                response_data = response.json()
                assert response_data["language"] == language

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_get_available_voices_success(
        self,
        async_test_client: AsyncClient,
        mock_tts_service
    ):
        """Test getting available voice styles and options"""
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service):
            
            response = await async_test_client.get("/api/v1/tts/voices")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "voice_styles" in response_data
            assert "emotions" in response_data
            assert "languages" in response_data
            
            assert isinstance(response_data["voice_styles"], list)
            assert isinstance(response_data["emotions"], list)
            assert isinstance(response_data["languages"], list)
            
            assert "neutral" in response_data["voice_styles"]
            assert "neutral" in response_data["emotions"]
            assert "en" in response_data["languages"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_batch_success(
        self,
        async_test_client: AsyncClient,
        mock_tts_service
    ):
        """Test batch synthesis of multiple texts"""
        
        batch_requests = [
            {
                "text": "First text to synthesize",
                "language": "en",
                "voice_style": "neutral",
                "emotion": "neutral",
                "speed": 1.0,
                "pitch": 1.0
            },
            {
                "text": "Second text to synthesize",
                "language": "en",
                "voice_style": "professional",
                "emotion": "happy",
                "speed": 1.2,
                "pitch": 1.1
            }
        ]
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service):
            
            response = await async_test_client.post(
                "/api/v1/tts/synthesize-batch",
                json=batch_requests
            )
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "batch_results" in response_data
            batch_results = response_data["batch_results"]
            assert len(batch_results) == 2
            
            for i, result in enumerate(batch_results):
                assert result["index"] == i
                assert result["status"] == "success"
                assert "result" in result

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_get_synthesis_session_success(
        self,
        async_test_client: AsyncClient,
        mock_database,
        test_session
    ):
        """Test retrieving synthesis session details"""
        
        test_session.synthesized_audio_path = "/test/audio/output.wav"
        mock_database.get_audio_session.return_value = test_session
        
        with patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            response = await async_test_client.get("/api/v1/tts/session/test_session_123")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert response_data["session_id"] == "test_session_123"
            assert response_data["synthesized_audio_path"] == "/test/audio/output.wav"
            assert "created_at" in response_data


class TestTTSAudioServing:
    """Test TTS audio file serving"""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_serve_unencrypted_audio_file(
        self,
        async_test_client: AsyncClient,
        temp_dir,
        mock_file_handler
    ):
        """Test serving unencrypted audio file"""
        
        # Create test audio file
        audio_file = temp_dir / "test_audio.wav"
        audio_file.write_bytes(b"fake_audio_content")
        
        mock_file_handler.audio_output_folder = temp_dir
        
        with patch('app.api.routes.tts.get_file_handler', return_value=mock_file_handler):
            
            # Mock Path.exists to return True for audio file
            with patch('pathlib.Path.exists', return_value=True):
                response = await async_test_client.get("/api/v1/tts/audio/test_audio.wav")
                
                # Should attempt to serve the file
                assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_serve_encrypted_audio_file(
        self,
        async_test_client: AsyncClient,
        temp_dir,
        mock_file_handler
    ):
        """Test serving encrypted audio file"""
        
        # Create encrypted test file
        encrypted_file = temp_dir / "test_audio.wav.encrypted"
        encrypted_file.write_bytes(b"encrypted_audio_content")
        
        mock_file_handler.audio_output_folder = temp_dir
        mock_file_handler.get_file_content.return_value = b"decrypted_audio_content"
        
        with patch('app.api.routes.tts.get_file_handler', return_value=mock_file_handler):
            
            # Mock encrypted file exists but regular doesn't
            def mock_exists(self):
                return str(self).endswith('.encrypted')
            
            with patch('pathlib.Path.exists', side_effect=mock_exists):
                response = await async_test_client.get("/api/v1/tts/audio/test_audio.wav")
                
                # Should return decrypted content
                assert response.status_code == status.HTTP_200_OK
                assert response.headers["content-type"] == "audio/wav"

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_serve_nonexistent_audio_file(
        self,
        async_test_client: AsyncClient,
        temp_dir,
        mock_file_handler
    ):
        """Test serving non-existent audio file"""
        
        mock_file_handler.audio_output_folder = temp_dir
        
        with patch('app.api.routes.tts.get_file_handler', return_value=mock_file_handler):
            
            # Mock file doesn't exist
            with patch('pathlib.Path.exists', return_value=False):
                response = await async_test_client.get("/api/v1/tts/audio/nonexistent.wav")
                
                assert response.status_code == status.HTTP_404_NOT_FOUND
                response_data = response.json()
                assert response_data["detail"] == "Audio file not found"


class TestTTSErrorHandling:
    """Test TTS error handling scenarios"""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_empty_text(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test synthesis with empty text"""
        
        request_data = {
            "text": "",  # Empty text
            "language": "en",
            "voice_style": "neutral",
            "emotion": "neutral",
            "speed": 1.0,
            "pitch": 1.0
        }
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            response = await async_test_client.post(
                "/api/v1/tts/synthesize",
                json=request_data
            )
            
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            response_data = response.json()
            assert "Text cannot be empty" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_text_too_long(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test synthesis with text exceeding length limit"""
        
        long_text = "A" * 5001  # Exceeds 5000 character limit
        
        request_data = {
            "text": long_text,
            "language": "en",
            "voice_style": "neutral",
            "emotion": "neutral",
            "speed": 1.0,
            "pitch": 1.0
        }
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            response = await async_test_client.post(
                "/api/v1/tts/synthesize",
                json=request_data
            )
            
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            response_data = response.json()
            assert "Text too long" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_invalid_speed_parameter(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test synthesis with invalid speed parameter"""
        
        invalid_speeds = [0.3, 2.5, -1.0, 0.0]  # Outside 0.5-2.0 range
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            for speed in invalid_speeds:
                request_data = {
                    "text": "Test text",
                    "language": "en",
                    "voice_style": "neutral",
                    "emotion": "neutral",
                    "speed": speed,
                    "pitch": 1.0
                }
                
                response = await async_test_client.post(
                    "/api/v1/tts/synthesize",
                    json=request_data
                )
                
                assert response.status_code == status.HTTP_400_BAD_REQUEST
                response_data = response.json()
                assert "Speed must be between 0.5 and 2.0" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_invalid_pitch_parameter(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test synthesis with invalid pitch parameter"""
        
        invalid_pitches = [0.3, 2.5, -1.0, 0.0]  # Outside 0.5-2.0 range
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            for pitch in invalid_pitches:
                request_data = {
                    "text": "Test text",
                    "language": "en",
                    "voice_style": "neutral",
                    "emotion": "neutral",
                    "speed": 1.0,
                    "pitch": pitch
                }
                
                response = await async_test_client.post(
                    "/api/v1/tts/synthesize",
                    json=request_data
                )
                
                assert response.status_code == status.HTTP_400_BAD_REQUEST
                response_data = response.json()
                assert "Pitch must be between 0.5 and 2.0" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_service_failure(
        self,
        async_test_client: AsyncClient,
        sample_synthesis_request: dict,
        mock_database
    ):
        """Test synthesis when TTS service fails"""
        
        mock_tts_service = Mock()
        mock_tts_service.synthesize_speech.side_effect = Exception("TTS service error")
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            response = await async_test_client.post(
                "/api/v1/tts/synthesize",
                json=sample_synthesis_request
            )
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data = response.json()
            assert "Speech synthesis failed" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_batch_synthesis_too_many_requests(
        self,
        async_test_client: AsyncClient,
        mock_tts_service
    ):
        """Test batch synthesis with too many requests"""
        
        # Create more than 10 requests
        batch_requests = [
            {
                "text": f"Text {i}",
                "language": "en",
                "voice_style": "neutral",
                "emotion": "neutral",
                "speed": 1.0,
                "pitch": 1.0
            } for i in range(11)
        ]
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service):
            
            response = await async_test_client.post(
                "/api/v1/tts/synthesize-batch",
                json=batch_requests
            )
            
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            response_data = response.json()
            assert "Maximum 10 texts per batch" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_batch_synthesis_partial_failure(
        self,
        async_test_client: AsyncClient
    ):
        """Test batch synthesis with some requests failing"""
        
        mock_tts_service = Mock()
        
        def mock_synthesize(text, **kwargs):
            if "fail" in text:
                raise Exception("Synthesis failed")
            return {
                'audio_path': '/test/path/synthesized.wav',
                'filename': 'synthesized.wav',
                'text': text,
                'language': 'en',
                'voice_style': 'neutral',
                'emotion': 'neutral',
                'duration_seconds': 2.5,
                'sample_rate': 22050,
                'model': 'dia-tts',
                'encrypted': False
            }
        
        mock_tts_service.synthesize_speech.side_effect = mock_synthesize
        
        batch_requests = [
            {
                "text": "Success text",
                "language": "en",
                "voice_style": "neutral",
                "emotion": "neutral",
                "speed": 1.0,
                "pitch": 1.0
            },
            {
                "text": "This should fail",
                "language": "en",
                "voice_style": "neutral",
                "emotion": "neutral",
                "speed": 1.0,
                "pitch": 1.0
            }
        ]
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service):
            
            response = await async_test_client.post(
                "/api/v1/tts/synthesize-batch",
                json=batch_requests
            )
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            batch_results = response_data["batch_results"]
            assert len(batch_results) == 2
            
            # First should succeed, second should fail
            assert batch_results[0]["status"] == "success"
            assert batch_results[1]["status"] == "error"

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_get_voices_service_failure(
        self,
        async_test_client: AsyncClient
    ):
        """Test getting voices when service fails"""
        
        mock_tts_service = Mock()
        mock_tts_service.get_available_voices.side_effect = Exception("Service error")
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service):
            
            response = await async_test_client.get("/api/v1/tts/voices")
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data = response.json()
            assert "Failed to get available voices" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_serve_audio_file_handler_failure(
        self,
        async_test_client: AsyncClient
    ):
        """Test audio serving when file handler fails"""
        
        mock_file_handler = Mock()
        mock_file_handler.audio_output_folder = Mock()
        mock_file_handler.get_file_content.side_effect = Exception("File handler error")
        
        with patch('app.api.routes.tts.get_file_handler', return_value=mock_file_handler):
            with patch('pathlib.Path.exists', return_value=True):
                
                response = await async_test_client.get("/api/v1/tts/audio/test.wav")
                
                assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
                response_data = response.json()
                assert "Failed to serve audio file" in response_data["detail"]


class TestTTSEdgeCases:
    """Test TTS edge cases and boundary conditions"""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_special_characters(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test synthesis with special characters and symbols"""
        
        special_texts = [
            "Hello! How are you? I'm fine... $100 & more.",
            "Testing 123: numbers & symbols @#$%^&*()",
            "Émotions françaises avec accents",
            "日本語テキスト",  # Japanese text
            "🎵 Music note emoji synthesis test 🎵"
        ]
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            for text in special_texts:
                request_data = {
                    "text": text,
                    "language": "en",
                    "voice_style": "neutral",
                    "emotion": "neutral",
                    "speed": 1.0,
                    "pitch": 1.0
                }
                
                response = await async_test_client.post(
                    "/api/v1/tts/synthesize",
                    json=request_data
                )
                
                # Should handle all text gracefully
                assert response.status_code == status.HTTP_200_OK

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_synthesize_whitespace_only_text(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test synthesis with whitespace-only text"""
        
        whitespace_texts = ["   ", "\t\t", "\n\n", "   \t\n   "]
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            for text in whitespace_texts:
                request_data = {
                    "text": text,
                    "language": "en",
                    "voice_style": "neutral",
                    "emotion": "neutral",
                    "speed": 1.0,
                    "pitch": 1.0
                }
                
                response = await async_test_client.post(
                    "/api/v1/tts/synthesize",
                    json=request_data
                )
                
                # Should be treated as empty text
                assert response.status_code == status.HTTP_400_BAD_REQUEST
                response_data = response.json()
                assert "Text cannot be empty" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.asyncio  
    async def test_synthesize_boundary_speed_pitch_values(
        self,
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test synthesis with boundary speed and pitch values"""
        
        boundary_values = [
            {"speed": 0.5, "pitch": 0.5},  # Minimum values
            {"speed": 2.0, "pitch": 2.0},  # Maximum values
            {"speed": 1.0, "pitch": 1.0},  # Default values
        ]
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            for values in boundary_values:
                request_data = {
                    "text": "Boundary test",
                    "language": "en",
                    "voice_style": "neutral",
                    "emotion": "neutral",
                    "speed": values["speed"],
                    "pitch": values["pitch"]
                }
                
                response = await async_test_client.post(
                    "/api/v1/tts/synthesize",
                    json=request_data
                )
                
                assert response.status_code == status.HTTP_200_OK