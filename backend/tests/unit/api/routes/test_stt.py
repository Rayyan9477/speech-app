"""
Unit tests for Speech-to-Text API endpoints
Tests all STT routes including transcription, language detection, and session management
"""

import pytest
from unittest.mock import patch, Mock, AsyncMock
from fastapi import status, UploadFile
from httpx import AsyncClient
import io
import asyncio
from pathlib import Path

from app.api.routes.stt import router
from app.services import get_stt_service, get_file_handler
from app.database import get_database


class TestSTTTranscription:
    """Test STT transcription endpoints"""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_audio_success(
        self, 
        async_test_client: AsyncClient, 
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test successful audio transcription"""
        
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
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "transcription" in response_data
            assert "language" in response_data
            assert "confidence" in response_data
            assert "duration_seconds" in response_data
            assert "model" in response_data
            assert "session_id" in response_data
            
            assert response_data["transcription"] == "Hello, this is a test transcription."
            assert response_data["language"] == "en"
            assert response_data["confidence"] == 0.95
            assert response_data["model"] == "whisper-large-v3-turbo"

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_with_auto_language_detection(
        self, 
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test transcription with automatic language detection"""
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                data = {"task": "transcribe"}  # No language specified
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            assert response_data["language"] == "en"

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_with_translation(
        self, 
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test transcription with translation to English"""
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                data = {"language": "es", "task": "translate"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            assert response.status_code == status.HTTP_200_OK
            mock_stt_service.transcribe_audio.assert_called_once()
            call_args = mock_stt_service.transcribe_audio.call_args
            assert call_args[1]['task'] == 'translate'

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_with_timestamps_success(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test transcription with word-level timestamps"""
        
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
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "transcription" in response_data
            assert "segments" in response_data
            assert "language" in response_data
            assert "model" in response_data
            
            segments = response_data["segments"]
            assert len(segments) == 2
            assert all("start" in seg and "end" in seg and "text" in seg for seg in segments)

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_detect_language_success(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler
    ):
        """Test audio language detection"""
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                
                response = await async_test_client.post(
                    "/api/v1/stt/detect-language",
                    files=files
                )
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            assert "detected_language" in response_data
            assert response_data["detected_language"] == "en"

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_get_transcription_session_success(
        self,
        async_test_client: AsyncClient,
        mock_database,
        test_session
    ):
        """Test retrieving transcription session details"""
        
        mock_database.get_audio_session.return_value = test_session
        
        with patch('app.api.routes.stt.get_database', return_value=mock_database):
            response = await async_test_client.get("/api/v1/stt/session/test_session_123")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert response_data["session_id"] == "test_session_123"
            assert response_data["original_filename"] == "test_audio.wav"
            assert response_data["transcription"] == "Test transcription"


class TestSTTErrorHandling:
    """Test STT error handling scenarios"""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_no_file_provided(self, async_test_client: AsyncClient):
        """Test transcription without providing file"""
        
        response = await async_test_client.post(
            "/api/v1/stt/transcribe",
            data={"language": "en"}
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_invalid_file_type(
        self, 
        async_test_client: AsyncClient,
        temp_dir
    ):
        """Test transcription with invalid file type"""
        
        # Create a text file instead of audio
        text_file = temp_dir / "test.txt"
        text_file.write_text("This is not an audio file")
        
        with open(text_file, 'rb') as file:
            files = {"file": ("test.txt", file, "text/plain")}
            data = {"language": "en", "task": "transcribe"}
            
            response = await async_test_client.post(
                "/api/v1/stt/transcribe",
                files=files,
                data=data
            )
        
        # Should still process but might fail at service level
        assert response.status_code in [status.HTTP_500_INTERNAL_SERVER_ERROR, status.HTTP_200_OK]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_service_failure(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_file_handler,
        mock_database
    ):
        """Test transcription when STT service fails"""
        
        mock_stt_service = Mock()
        mock_stt_service.transcribe_audio.side_effect = Exception("STT service error")
        
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
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data = response.json()
            assert "detail" in response_data
            assert "Transcription failed" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_file_save_failure(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_database
    ):
        """Test transcription when file save fails"""
        
        mock_file_handler = Mock()
        mock_file_handler.save_upload_file = AsyncMock(side_effect=OSError("File save error"))
        
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
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_get_session_not_found(
        self,
        async_test_client: AsyncClient,
        mock_database
    ):
        """Test getting non-existent session"""
        
        mock_database.get_audio_session.return_value = None
        
        with patch('app.api.routes.stt.get_database', return_value=mock_database):
            response = await async_test_client.get("/api/v1/stt/session/nonexistent")
            
            assert response.status_code == status.HTTP_404_NOT_FOUND
            response_data = response.json()
            assert response_data["detail"] == "Session not found"

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_get_session_database_error(
        self,
        async_test_client: AsyncClient,
        mock_database
    ):
        """Test getting session when database fails"""
        
        mock_database.get_audio_session.side_effect = Exception("Database error")
        
        with patch('app.api.routes.stt.get_database', return_value=mock_database):
            response = await async_test_client.get("/api/v1/stt/session/test_id")
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


class TestSTTEdgeCases:
    """Test STT edge cases and boundary conditions"""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_empty_audio_file(
        self,
        async_test_client: AsyncClient,
        temp_dir,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test transcription with empty audio file"""
        
        # Create empty audio file
        empty_file = temp_dir / "empty.wav"
        empty_file.touch()
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            with open(empty_file, 'rb') as audio_file:
                files = {"file": ("empty.wav", audio_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            # Should handle gracefully
            assert response.status_code in [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR]

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_corrupted_audio_file(
        self,
        async_test_client: AsyncClient,
        corrupted_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test transcription with corrupted audio file"""
        
        mock_stt_service.transcribe_audio.side_effect = Exception("Corrupted audio file")
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            with open(corrupted_audio_file, 'rb') as audio_file:
                files = {"file": ("corrupted.wav", audio_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_unsupported_language(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test transcription with unsupported language"""
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                data = {"language": "xyz", "task": "transcribe"}  # Invalid language code
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            # Should still pass through to service and let it handle
            assert response.status_code == status.HTTP_200_OK

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_transcribe_invalid_task(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test transcription with invalid task parameter"""
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
                data = {"language": "en", "task": "invalid_task"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            # Should pass through and let service validate
            assert response.status_code == status.HTTP_200_OK


class TestSTTCleanup:
    """Test STT file cleanup and resource management"""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_background_task_cleanup_called(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test that background cleanup task is scheduled"""
        
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
            
            assert response.status_code == status.HTTP_200_OK
            
            # Wait a bit for background task to potentially execute
            await asyncio.sleep(0.1)
            
            # Verify file handler cleanup methods would be called
            mock_file_handler.delete_file.assert_called()