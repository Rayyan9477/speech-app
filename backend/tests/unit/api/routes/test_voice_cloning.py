"""
Unit tests for Voice Cloning API endpoints
Tests all voice cloning routes including creation, synthesis, similarity search, and management
"""

import pytest
from unittest.mock import patch, Mock, AsyncMock
from fastapi import status
from httpx import AsyncClient
import asyncio
from pathlib import Path

from app.api.routes.voice_cloning import router


class TestVoiceCloneCreation:
    """Test voice clone creation endpoints"""

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_create_voice_clone_success(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test successful voice clone creation"""
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                data = {"name": "Test Voice Clone", "user_id": "test_user_123"}
                
                response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "clone_id" in response_data
            assert "name" in response_data
            assert "status" in response_data
            assert "embedding_path" in response_data
            assert "embedding_dimensions" in response_data
            assert "sample_path" in response_data
            
            assert response_data["name"] == "Test Voice Clone"
            assert response_data["status"] == "completed"
            assert response_data["clone_id"] == "test_clone_123"
            assert response_data["embedding_dimensions"] == 512

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_create_voice_clone_without_user_id(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test voice clone creation without user ID"""
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                data = {"name": "Anonymous Voice Clone"}
                
                response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            assert response_data["name"] == "Anonymous Voice Clone"

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_create_voice_clone_empty_name(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test voice clone creation with empty name"""
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                data = {"name": "", "user_id": "test_user_123"}
                
                response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            response_data = response.json()
            assert "Voice clone name cannot be empty" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_create_voice_clone_name_too_long(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test voice clone creation with name too long"""
        
        long_name = "A" * 101  # Exceeds 100 character limit
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                data = {"name": long_name, "user_id": "test_user_123"}
                
                response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            response_data = response.json()
            assert "Name too long" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_create_voice_clone_no_file(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test voice clone creation without file"""
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            data = {"name": "Test Voice Clone", "user_id": "test_user_123"}
            
            response = await async_test_client.post(
                "/api/v1/voice/create-clone",
                data=data
            )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestVoiceSynthesis:
    """Test voice synthesis with cloned voices"""

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_synthesize_with_cloned_voice_success(
        self,
        async_test_client: AsyncClient,
        sample_voice_synthesis_request: dict,
        mock_voice_cloning_service
    ):
        """Test successful synthesis with cloned voice"""
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.post(
                "/api/v1/voice/synthesize",
                json=sample_voice_synthesis_request
            )
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "audio_path" in response_data
            assert "clone_id" in response_data
            assert "text" in response_data
            assert "language" in response_data
            assert "duration" in response_data
            assert "sample_rate" in response_data
            
            assert response_data["clone_id"] == "test_clone_123"
            assert response_data["text"] == sample_voice_synthesis_request["text"]
            assert response_data["language"] == sample_voice_synthesis_request["language"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_synthesize_with_cloned_voice_empty_text(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test synthesis with empty text"""
        
        request_data = {
            "text": "",
            "clone_id": "test_clone_123",
            "language": "en"
        }
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.post(
                "/api/v1/voice/synthesize",
                json=request_data
            )
            
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            response_data = response.json()
            assert "Text cannot be empty" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_synthesize_with_cloned_voice_text_too_long(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test synthesis with text exceeding limit"""
        
        long_text = "A" * 5001  # Exceeds 5000 character limit
        
        request_data = {
            "text": long_text,
            "clone_id": "test_clone_123",
            "language": "en"
        }
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.post(
                "/api/v1/voice/synthesize",
                json=request_data
            )
            
            assert response.status_code == status.HTTP_400_BAD_REQUEST
            response_data = response.json()
            assert "Text too long" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_synthesize_multiple_languages(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test synthesis with different languages"""
        
        languages = ["en", "es", "fr", "de"]
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            for language in languages:
                request_data = {
                    "text": f"Hello in {language}",
                    "clone_id": "test_clone_123",
                    "language": language
                }
                
                response = await async_test_client.post(
                    "/api/v1/voice/synthesize",
                    json=request_data
                )
                
                assert response.status_code == status.HTTP_200_OK
                response_data = response.json()
                assert response_data["language"] == language


class TestVoiceCloneManagement:
    """Test voice clone management operations"""

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_list_voice_clones_success(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test listing voice clones"""
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.get("/api/v1/voice/list")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "voice_clones" in response_data
            assert "total" in response_data
            assert isinstance(response_data["voice_clones"], list)
            assert response_data["total"] == len(response_data["voice_clones"])

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_list_voice_clones_with_user_filter(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test listing voice clones filtered by user ID"""
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.get("/api/v1/voice/list?user_id=test_user_123")
            
            assert response.status_code == status.HTTP_200_OK
            
            # Verify service was called with user filter
            mock_voice_cloning_service.list_voice_clones.assert_called_with(user_id="test_user_123")

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_get_voice_clone_info_success(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test getting voice clone information"""
        
        # Mock the service to return clone info
        mock_voice_cloning_service.list_voice_clones.return_value = [{
            'clone_id': 'test_clone_123',
            'name': 'Test Voice Clone',
            'status': 'completed',
            'created_at': '2023-01-01T00:00:00'
        }]
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.get("/api/v1/voice/test_clone_123/info")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            assert response_data["clone_id"] == "test_clone_123"
            assert response_data["name"] == "Test Voice Clone"

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_get_voice_clone_info_not_found(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test getting non-existent voice clone info"""
        
        # Mock empty list (no clones found)
        mock_voice_cloning_service.list_voice_clones.return_value = []
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.get("/api/v1/voice/nonexistent/info")
            
            assert response.status_code == status.HTTP_404_NOT_FOUND
            response_data = response.json()
            assert response_data["detail"] == "Voice clone not found"

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_delete_voice_clone_success(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test successful voice clone deletion"""
        
        mock_voice_cloning_service.delete_voice_clone.return_value = True
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.delete("/api/v1/voice/test_clone_123")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            assert "deleted successfully" in response_data["message"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_delete_voice_clone_not_found(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test deleting non-existent voice clone"""
        
        mock_voice_cloning_service.delete_voice_clone.return_value = False
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.delete("/api/v1/voice/nonexistent")
            
            assert response.status_code == status.HTTP_404_NOT_FOUND
            response_data = response.json()
            assert response_data["detail"] == "Voice clone not found"


class TestVoiceSimilarity:
    """Test voice similarity search functionality"""

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_find_similar_voices_success(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test finding similar voices"""
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.get("/api/v1/voice/similar/test_clone_123")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "similar_voices" in response_data
            similar_voices = response_data["similar_voices"]
            assert isinstance(similar_voices, list)
            assert len(similar_voices) <= 5  # Default limit
            
            for voice in similar_voices:
                assert "clone_id" in voice
                assert "similarity_distance" in voice
                assert "metadata" in voice

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_find_similar_voices_with_custom_limit(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test finding similar voices with custom result limit"""
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.get("/api/v1/voice/similar/test_clone_123?n_results=8")
            
            assert response.status_code == status.HTTP_200_OK
            
            # Verify service was called with custom limit
            mock_voice_cloning_service.find_similar_voices.assert_called_with(
                clone_id="test_clone_123",
                n_results=8
            )

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_find_similar_voices_limit_cap(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test that similarity search limits results to maximum of 10"""
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.get("/api/v1/voice/similar/test_clone_123?n_results=15")
            
            assert response.status_code == status.HTTP_200_OK
            
            # Verify service was called with capped limit
            mock_voice_cloning_service.find_similar_voices.assert_called_with(
                clone_id="test_clone_123",
                n_results=10  # Should be capped at 10
            )


class TestVoiceEmbedding:
    """Test voice embedding extraction"""

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_extract_voice_embedding_success(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        voice_embedding_sample
    ):
        """Test successful voice embedding extraction"""
        
        mock_voice_cloning_service.extract_voice_embedding.return_value = voice_embedding_sample
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                
                response = await async_test_client.post(
                    "/api/v1/voice/extract-embedding",
                    files=files
                )
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert "embedding_dimensions" in response_data
            assert "embedding_stats" in response_data
            assert "message" in response_data
            
            stats = response_data["embedding_stats"]
            assert "mean" in stats
            assert "std" in stats
            assert "min" in stats
            assert "max" in stats
            
            assert response_data["embedding_dimensions"] == 512

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_extract_voice_embedding_cleanup(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        voice_embedding_sample
    ):
        """Test that temporary files are cleaned up after embedding extraction"""
        
        mock_voice_cloning_service.extract_voice_embedding.return_value = voice_embedding_sample
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                
                response = await async_test_client.post(
                    "/api/v1/voice/extract-embedding",
                    files=files
                )
            
            assert response.status_code == status.HTTP_200_OK
            
            # Wait for background task
            await asyncio.sleep(0.1)
            
            # Verify cleanup was scheduled
            mock_file_handler.delete_file.assert_called()


class TestVoiceCloningErrorHandling:
    """Test voice cloning error handling scenarios"""

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_create_voice_clone_service_failure(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_file_handler,
        mock_database
    ):
        """Test voice clone creation when service fails"""
        
        mock_voice_cloning_service = Mock()
        mock_voice_cloning_service.create_voice_clone.side_effect = Exception("Service error")
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                data = {"name": "Test Voice Clone", "user_id": "test_user_123"}
                
                response = await async_test_client.post(
                    "/api/v1/voice/create-clone",
                    files=files,
                    data=data
                )
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data = response.json()
            assert "Voice clone creation failed" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_synthesize_with_cloned_voice_service_failure(
        self,
        async_test_client: AsyncClient,
        sample_voice_synthesis_request: dict
    ):
        """Test synthesis when voice cloning service fails"""
        
        mock_voice_cloning_service = Mock()
        mock_voice_cloning_service.synthesize_with_cloned_voice.side_effect = Exception("Synthesis error")
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.post(
                "/api/v1/voice/synthesize",
                json=sample_voice_synthesis_request
            )
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data = response.json()
            assert "Synthesis failed" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_list_voice_clones_service_failure(
        self,
        async_test_client: AsyncClient
    ):
        """Test listing voice clones when service fails"""
        
        mock_voice_cloning_service = Mock()
        mock_voice_cloning_service.list_voice_clones.side_effect = Exception("Database error")
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.get("/api/v1/voice/list")
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data = response.json()
            assert "Failed to list voice clones" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_find_similar_voices_service_failure(
        self,
        async_test_client: AsyncClient
    ):
        """Test similar voice search when service fails"""
        
        mock_voice_cloning_service = Mock()
        mock_voice_cloning_service.find_similar_voices.side_effect = Exception("Vector search error")
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.get("/api/v1/voice/similar/test_clone_123")
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data = response.json()
            assert "Similar voice search failed" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_delete_voice_clone_service_failure(
        self,
        async_test_client: AsyncClient
    ):
        """Test voice clone deletion when service fails"""
        
        mock_voice_cloning_service = Mock()
        mock_voice_cloning_service.delete_voice_clone.side_effect = Exception("Deletion error")
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            response = await async_test_client.delete("/api/v1/voice/test_clone_123")
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data = response.json()
            assert "Voice clone deletion failed" in response_data["detail"]

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_extract_embedding_service_failure(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_file_handler
    ):
        """Test embedding extraction when service fails"""
        
        mock_voice_cloning_service = Mock()
        mock_voice_cloning_service.extract_voice_embedding.side_effect = Exception("Embedding error")
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler):
            
            with open(sample_audio_file, 'rb') as audio_file:
                files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                
                response = await async_test_client.post(
                    "/api/v1/voice/extract-embedding",
                    files=files
                )
            
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            response_data = response.json()
            assert "Voice embedding extraction failed" in response_data["detail"]


class TestVoiceCloningEdgeCases:
    """Test voice cloning edge cases and boundary conditions"""

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_create_voice_clone_with_special_characters_in_name(
        self,
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test voice clone creation with special characters in name"""
        
        special_names = [
            "Voice Clone #1",
            "Test Voice (Clone)",
            "My Voice @Home",
            "Voice-Clone_123",
            "Français Voice",
            "Voice 日本語"
        ]
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            for name in special_names:
                with open(sample_audio_file, 'rb') as audio_file:
                    files = {"file": ("voice_sample.wav", audio_file, "audio/wav")}
                    data = {"name": name, "user_id": "test_user_123"}
                    
                    response = await async_test_client.post(
                        "/api/v1/voice/create-clone",
                        files=files,
                        data=data
                    )
                
                # Should handle all names gracefully
                assert response.status_code == status.HTTP_200_OK

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_synthesize_with_very_short_text(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test synthesis with very short text"""
        
        short_texts = ["A", "Hi", ".", "1", "?"]
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            for text in short_texts:
                request_data = {
                    "text": text,
                    "clone_id": "test_clone_123",
                    "language": "en"
                }
                
                response = await async_test_client.post(
                    "/api/v1/voice/synthesize",
                    json=request_data
                )
                
                # Should handle short text gracefully
                assert response.status_code == status.HTTP_200_OK

    @pytest.mark.unit
    @pytest.mark.voice_cloning
    @pytest.mark.asyncio
    async def test_synthesize_with_unicode_text(
        self,
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test synthesis with unicode text"""
        
        unicode_texts = [
            "Hello 世界",
            "Café français",
            "Математика",
            "🎵 Music test 🎵",
            "Ñoño español"
        ]
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            
            for text in unicode_texts:
                request_data = {
                    "text": text,
                    "clone_id": "test_clone_123",
                    "language": "en"
                }
                
                response = await async_test_client.post(
                    "/api/v1/voice/synthesize",
                    json=request_data
                )
                
                # Should handle unicode text gracefully
                assert response.status_code == status.HTTP_200_OK