"""
Unit tests for Real-time Streaming API endpoints
Tests WebSocket connections, real-time transcription, and streaming functionality
"""

import pytest
from unittest.mock import patch, Mock, AsyncMock, MagicMock
from fastapi import status
from httpx import AsyncClient
import asyncio
import json
import numpy as np
from fastapi.websockets import WebSocketDisconnect
import io

from app.api.routes.streaming import router, ConnectionManager, manager, _transcribe_chunk


class TestStreamingStatus:
    """Test streaming status and health endpoints"""

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_stream_transcription_status(self, async_test_client: AsyncClient):
        """Test streaming service status endpoint"""
        
        response = await async_test_client.get("/api/v1/stream/stream/transcribe")
        
        assert response.status_code == status.HTTP_200_OK
        response_data = response.json()
        
        assert "service" in response_data
        assert "active_connections" in response_data
        assert "supported_sample_rate" in response_data
        assert "supported_format" in response_data
        assert "chunk_duration" in response_data
        
        assert response_data["service"] == "Real-time STT"
        assert response_data["supported_sample_rate"] == 16000
        assert response_data["supported_format"] == "16-bit PCM mono"

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_streaming_test_endpoint_success(
        self, 
        async_test_client: AsyncClient,
        mock_stt_service
    ):
        """Test streaming test endpoint when service is ready"""
        
        # Mock model is loaded
        mock_stt_service.processor = Mock()
        mock_stt_service.model = Mock()
        mock_stt_service.load_model = Mock()
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            response = await async_test_client.post("/api/v1/stream/stream/test")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert response_data["streaming_ready"] is True
            assert response_data["model_loaded"] is True
            assert response_data["test_status"] == "OK"
            assert "websocket_endpoint" in response_data

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_streaming_test_endpoint_model_not_loaded(
        self, 
        async_test_client: AsyncClient
    ):
        """Test streaming test endpoint when model needs loading"""
        
        mock_stt_service = Mock()
        mock_stt_service.processor = None
        mock_stt_service.model = None
        mock_stt_service.load_model = Mock()
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            response = await async_test_client.post("/api/v1/stream/stream/test")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert response_data["streaming_ready"] is True
            assert response_data["model_loaded"] is True
            
            # Verify model loading was called
            mock_stt_service.load_model.assert_called_once()

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_streaming_test_endpoint_service_failure(
        self, 
        async_test_client: AsyncClient
    ):
        """Test streaming test endpoint when service fails"""
        
        mock_stt_service = Mock()
        mock_stt_service.processor = None
        mock_stt_service.model = None
        mock_stt_service.load_model.side_effect = Exception("Model loading failed")
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            response = await async_test_client.post("/api/v1/stream/stream/test")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            
            assert response_data["streaming_ready"] is False
            assert response_data["model_loaded"] is False
            assert response_data["test_status"] == "FAILED"
            assert "error" in response_data


class TestConnectionManager:
    """Test WebSocket connection manager"""

    @pytest.fixture
    def connection_manager(self):
        """Create a fresh connection manager for testing"""
        return ConnectionManager()

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_connect_client(self, connection_manager, mock_websocket):
        """Test connecting a WebSocket client"""
        
        client_id = "test_client_123"
        
        await connection_manager.connect(mock_websocket, client_id)
        
        assert client_id in connection_manager.active_connections
        assert connection_manager.active_connections[client_id] == mock_websocket
        mock_websocket.accept.assert_called_once()

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_disconnect_client(self, connection_manager, mock_websocket):
        """Test disconnecting a WebSocket client"""
        
        client_id = "test_client_123"
        
        # First connect
        await connection_manager.connect(mock_websocket, client_id)
        assert client_id in connection_manager.active_connections
        
        # Then disconnect
        connection_manager.disconnect(client_id)
        assert client_id not in connection_manager.active_connections

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_disconnect_nonexistent_client(self, connection_manager):
        """Test disconnecting a non-existent client"""
        
        # Should not raise error
        connection_manager.disconnect("nonexistent_client")

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_send_message_to_connected_client(
        self, 
        connection_manager, 
        mock_websocket
    ):
        """Test sending message to connected client"""
        
        client_id = "test_client_123"
        test_message = {"type": "test", "content": "Hello"}
        
        await connection_manager.connect(mock_websocket, client_id)
        await connection_manager.send_message(client_id, test_message)
        
        mock_websocket.send_text.assert_called_once_with(json.dumps(test_message))

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_send_message_to_disconnected_client(self, connection_manager):
        """Test sending message to disconnected client"""
        
        test_message = {"type": "test", "content": "Hello"}
        
        # Should not raise error when client doesn't exist
        await connection_manager.send_message("nonexistent_client", test_message)

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_multiple_clients(self, connection_manager):
        """Test managing multiple client connections"""
        
        mock_ws1 = Mock()
        mock_ws1.accept = AsyncMock()
        mock_ws2 = Mock()
        mock_ws2.accept = AsyncMock()
        
        client_id1 = "client_1"
        client_id2 = "client_2"
        
        await connection_manager.connect(mock_ws1, client_id1)
        await connection_manager.connect(mock_ws2, client_id2)
        
        assert len(connection_manager.active_connections) == 2
        assert client_id1 in connection_manager.active_connections
        assert client_id2 in connection_manager.active_connections
        
        # Disconnect one
        connection_manager.disconnect(client_id1)
        
        assert len(connection_manager.active_connections) == 1
        assert client_id1 not in connection_manager.active_connections
        assert client_id2 in connection_manager.active_connections


class TestChunkTranscription:
    """Test audio chunk transcription functionality"""

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.audio
    def test_transcribe_chunk_success(self, mock_stt_service):
        """Test successful audio chunk transcription"""
        
        # Create mock audio data
        audio_array = np.random.rand(16000).astype(np.float32)  # 1 second of audio
        
        # Mock STT service components
        mock_processor = Mock()
        mock_model = Mock()
        mock_inputs = Mock()
        mock_inputs.input_features = Mock()
        
        mock_stt_service.processor = mock_processor
        mock_stt_service.model = mock_model
        mock_stt_service.device = "cpu"
        
        mock_processor.return_value = mock_inputs
        mock_inputs.to.return_value = mock_inputs
        
        # Mock model generation
        mock_generated_ids = Mock()
        mock_model.generate.return_value = mock_generated_ids
        
        # Mock decoder
        mock_processor.batch_decode.return_value = ["Hello world"]
        
        with patch('torch.no_grad'):
            result = _transcribe_chunk(mock_stt_service, audio_array)
        
        assert "transcription" in result
        assert "confidence" in result
        assert "timestamp" in result
        assert result["transcription"] == "Hello world"
        assert result["confidence"] == 1.0

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.audio
    def test_transcribe_chunk_with_processing_error(self, mock_stt_service):
        """Test chunk transcription with processing error"""
        
        audio_array = np.random.rand(16000).astype(np.float32)
        
        mock_stt_service.processor = Mock()
        mock_stt_service.processor.side_effect = Exception("Processing error")
        
        result = _transcribe_chunk(mock_stt_service, audio_array)
        
        assert "transcription" in result
        assert "confidence" in result
        assert "error" in result
        assert result["transcription"] == ""
        assert result["confidence"] == 0.0

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.audio
    def test_transcribe_chunk_with_model_error(self, mock_stt_service):
        """Test chunk transcription with model generation error"""
        
        audio_array = np.random.rand(16000).astype(np.float32)
        
        # Mock setup that fails at generation
        mock_processor = Mock()
        mock_model = Mock()
        mock_inputs = Mock()
        mock_inputs.input_features = Mock()
        
        mock_stt_service.processor = mock_processor
        mock_stt_service.model = mock_model
        mock_stt_service.device = "cpu"
        
        mock_processor.return_value = mock_inputs
        mock_inputs.to.return_value = mock_inputs
        
        # Mock model generation failure
        mock_model.generate.side_effect = Exception("Model error")
        
        with patch('torch.no_grad'):
            result = _transcribe_chunk(mock_stt_service, audio_array)
        
        assert result["transcription"] == ""
        assert result["confidence"] == 0.0
        assert "error" in result

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.audio
    def test_transcribe_chunk_with_empty_audio(self, mock_stt_service):
        """Test chunk transcription with empty audio array"""
        
        audio_array = np.array([])
        
        # Mock setup
        mock_processor = Mock()
        mock_model = Mock()
        mock_inputs = Mock()
        mock_inputs.input_features = Mock()
        
        mock_stt_service.processor = mock_processor
        mock_stt_service.model = mock_model
        mock_stt_service.device = "cpu"
        
        mock_processor.return_value = mock_inputs
        mock_inputs.to.return_value = mock_inputs
        
        mock_generated_ids = Mock()
        mock_model.generate.return_value = mock_generated_ids
        mock_processor.batch_decode.return_value = [""]
        
        with patch('torch.no_grad'):
            result = _transcribe_chunk(mock_stt_service, audio_array)
        
        assert "transcription" in result
        assert result["transcription"] == ""

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.audio
    def test_transcribe_chunk_with_different_audio_lengths(self, mock_stt_service):
        """Test chunk transcription with various audio lengths"""
        
        audio_lengths = [8000, 16000, 24000, 32000]  # Different durations
        
        # Mock setup
        mock_processor = Mock()
        mock_model = Mock()
        mock_inputs = Mock()
        mock_inputs.input_features = Mock()
        
        mock_stt_service.processor = mock_processor
        mock_stt_service.model = mock_model
        mock_stt_service.device = "cpu"
        
        mock_processor.return_value = mock_inputs
        mock_inputs.to.return_value = mock_inputs
        
        mock_generated_ids = Mock()
        mock_model.generate.return_value = mock_generated_ids
        mock_processor.batch_decode.return_value = ["Test transcription"]
        
        for length in audio_lengths:
            audio_array = np.random.rand(length).astype(np.float32)
            
            with patch('torch.no_grad'):
                result = _transcribe_chunk(mock_stt_service, audio_array)
            
            assert result["transcription"] == "Test transcription"
            assert result["confidence"] == 1.0


class TestWebSocketTranscription:
    """Test WebSocket real-time transcription endpoint"""

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.websocket
    @pytest.mark.asyncio
    async def test_websocket_connection_establishment(self):
        """Test WebSocket connection establishment"""
        
        mock_websocket = Mock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.receive_bytes = AsyncMock(side_effect=WebSocketDisconnect())
        
        mock_stt_service = Mock()
        mock_stt_service.processor = Mock()
        mock_stt_service.model = Mock()
        mock_stt_service.load_model = Mock()
        
        from app.api.routes.streaming import websocket_transcribe
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            with patch('app.api.routes.streaming.manager') as mock_manager:
                mock_manager.connect = AsyncMock()
                mock_manager.disconnect = Mock()
                
                # Should handle WebSocketDisconnect gracefully
                await websocket_transcribe(mock_websocket, "test_client")
                
                mock_manager.connect.assert_called_once_with(mock_websocket, "test_client")
                mock_manager.disconnect.assert_called_once_with("test_client")

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.websocket
    @pytest.mark.asyncio
    async def test_websocket_model_loading(self):
        """Test WebSocket endpoint loads model if needed"""
        
        mock_websocket = Mock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.receive_bytes = AsyncMock(side_effect=WebSocketDisconnect())
        
        mock_stt_service = Mock()
        mock_stt_service.processor = None  # Model not loaded
        mock_stt_service.model = None
        mock_stt_service.load_model = Mock()
        
        from app.api.routes.streaming import websocket_transcribe
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            with patch('app.api.routes.streaming.manager') as mock_manager:
                mock_manager.connect = AsyncMock()
                mock_manager.disconnect = Mock()
                
                await websocket_transcribe(mock_websocket, "test_client")
                
                # Verify model loading was called
                mock_stt_service.load_model.assert_called_once()

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.websocket
    @pytest.mark.asyncio
    async def test_websocket_audio_processing(self):
        """Test WebSocket audio data processing"""
        
        # Create mock audio data (1 second of 16kHz 16-bit audio)
        chunk_size = 16000 * 2  # bytes
        audio_data = bytes(chunk_size)
        
        mock_websocket = Mock()
        mock_websocket.accept = AsyncMock()
        
        # First return audio data, then disconnect
        mock_websocket.receive_bytes = AsyncMock(side_effect=[audio_data, WebSocketDisconnect()])
        
        mock_stt_service = Mock()
        mock_stt_service.processor = Mock()
        mock_stt_service.model = Mock()
        mock_stt_service.load_model = Mock()
        
        from app.api.routes.streaming import websocket_transcribe
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            with patch('app.api.routes.streaming.manager') as mock_manager:
                mock_manager.connect = AsyncMock()
                mock_manager.disconnect = Mock()
                mock_manager.send_message = AsyncMock()
                
                # Mock the transcription function
                with patch('app.api.routes.streaming._transcribe_chunk') as mock_transcribe:
                    mock_transcribe.return_value = {
                        "transcription": "Hello world",
                        "confidence": 0.95
                    }
                    
                    with patch('asyncio.get_event_loop') as mock_loop:
                        mock_executor = Mock()
                        mock_executor.run_in_executor = AsyncMock(return_value={
                            "transcription": "Hello world",
                            "confidence": 0.95
                        })
                        mock_loop.return_value = mock_executor
                        
                        await websocket_transcribe(mock_websocket, "test_client")
                
                # Verify message was sent
                mock_manager.send_message.assert_called()
                call_args = mock_manager.send_message.call_args
                assert call_args[0][0] == "test_client"
                message = call_args[0][1]
                assert message["type"] == "transcription"
                assert "text" in message

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.websocket
    @pytest.mark.asyncio
    async def test_websocket_transcription_error(self):
        """Test WebSocket handling of transcription errors"""
        
        chunk_size = 16000 * 2
        audio_data = bytes(chunk_size)
        
        mock_websocket = Mock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.receive_bytes = AsyncMock(side_effect=[audio_data, WebSocketDisconnect()])
        
        mock_stt_service = Mock()
        mock_stt_service.processor = Mock()
        mock_stt_service.model = Mock()
        mock_stt_service.load_model = Mock()
        
        from app.api.routes.streaming import websocket_transcribe
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            with patch('app.api.routes.streaming.manager') as mock_manager:
                mock_manager.connect = AsyncMock()
                mock_manager.disconnect = Mock()
                mock_manager.send_message = AsyncMock()
                
                # Mock transcription failure
                with patch('asyncio.get_event_loop') as mock_loop:
                    mock_executor = Mock()
                    mock_executor.run_in_executor = AsyncMock(side_effect=Exception("Transcription error"))
                    mock_loop.return_value = mock_executor
                    
                    await websocket_transcribe(mock_websocket, "test_client")
                
                # Verify error message was sent
                mock_manager.send_message.assert_called()
                call_args = mock_manager.send_message.call_args
                message = call_args[0][1]
                assert message["type"] == "error"
                assert "Transcription failed" in message["message"]

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.websocket
    @pytest.mark.asyncio
    async def test_websocket_unexpected_error(self):
        """Test WebSocket handling of unexpected errors"""
        
        mock_websocket = Mock()
        mock_websocket.accept = AsyncMock(side_effect=Exception("Connection error"))
        
        mock_stt_service = Mock()
        mock_stt_service.processor = Mock()
        mock_stt_service.model = Mock()
        
        from app.api.routes.streaming import websocket_transcribe
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            with patch('app.api.routes.streaming.manager') as mock_manager:
                mock_manager.connect = AsyncMock(side_effect=Exception("Connection error"))
                mock_manager.disconnect = Mock()
                
                # Should handle error gracefully
                await websocket_transcribe(mock_websocket, "test_client")
                
                # Verify disconnect was called
                mock_manager.disconnect.assert_called_once_with("test_client")


class TestStreamingEdgeCases:
    """Test streaming edge cases and boundary conditions"""

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.asyncio
    async def test_streaming_status_with_active_connections(self, async_test_client):
        """Test streaming status endpoint with active connections"""
        
        # Simulate active connections
        original_connections = manager.active_connections.copy()
        manager.active_connections["client1"] = Mock()
        manager.active_connections["client2"] = Mock()
        manager.active_connections["client3"] = Mock()
        
        try:
            response = await async_test_client.get("/api/v1/stream/stream/transcribe")
            
            assert response.status_code == status.HTTP_200_OK
            response_data = response.json()
            assert response_data["active_connections"] == 3
        
        finally:
            # Restore original connections
            manager.active_connections.clear()
            manager.active_connections.update(original_connections)

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.audio
    def test_transcribe_chunk_with_noise_audio(self, mock_stt_service):
        """Test chunk transcription with noisy audio data"""
        
        # Create noisy audio data (random noise)
        audio_array = np.random.normal(0, 0.1, 16000).astype(np.float32)
        
        # Mock setup
        mock_processor = Mock()
        mock_model = Mock()
        mock_inputs = Mock()
        mock_inputs.input_features = Mock()
        
        mock_stt_service.processor = mock_processor
        mock_stt_service.model = mock_model
        mock_stt_service.device = "cpu"
        
        mock_processor.return_value = mock_inputs
        mock_inputs.to.return_value = mock_inputs
        
        mock_generated_ids = Mock()
        mock_model.generate.return_value = mock_generated_ids
        mock_processor.batch_decode.return_value = [""]  # Noise results in empty transcription
        
        with patch('torch.no_grad'):
            result = _transcribe_chunk(mock_stt_service, audio_array)
        
        assert result["transcription"] == ""
        assert result["confidence"] == 1.0  # Service still returns confidence

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.audio
    def test_transcribe_chunk_with_clipped_audio(self, mock_stt_service):
        """Test chunk transcription with clipped audio data"""
        
        # Create clipped audio (values at extreme ranges)
        audio_array = np.ones(16000, dtype=np.float32)  # All 1.0 values (clipped)
        
        # Mock setup
        mock_processor = Mock()
        mock_model = Mock()
        mock_inputs = Mock()
        mock_inputs.input_features = Mock()
        
        mock_stt_service.processor = mock_processor
        mock_stt_service.model = mock_model
        mock_stt_service.device = "cpu"
        
        mock_processor.return_value = mock_inputs
        mock_inputs.to.return_value = mock_inputs
        
        mock_generated_ids = Mock()
        mock_model.generate.return_value = mock_generated_ids
        mock_processor.batch_decode.return_value = ["Clipped audio detected"]
        
        with patch('torch.no_grad'):
            result = _transcribe_chunk(mock_stt_service, audio_array)
        
        assert "transcription" in result
        assert result["transcription"] == "Clipped audio detected"

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.websocket
    @pytest.mark.asyncio
    async def test_websocket_with_small_audio_chunks(self):
        """Test WebSocket with audio chunks smaller than expected chunk size"""
        
        # Create small audio chunks
        small_chunk = bytes(1000)  # Much smaller than 16000 * 2
        
        mock_websocket = Mock()
        mock_websocket.accept = AsyncMock()
        
        # Send multiple small chunks then disconnect
        mock_websocket.receive_bytes = AsyncMock(side_effect=[
            small_chunk, small_chunk, small_chunk, WebSocketDisconnect()
        ])
        
        mock_stt_service = Mock()
        mock_stt_service.processor = Mock()
        mock_stt_service.model = Mock()
        
        from app.api.routes.streaming import websocket_transcribe
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            with patch('app.api.routes.streaming.manager') as mock_manager:
                mock_manager.connect = AsyncMock()
                mock_manager.disconnect = Mock()
                mock_manager.send_message = AsyncMock()
                
                await websocket_transcribe(mock_websocket, "test_client")
                
                # Should buffer small chunks and not process until chunk_size is reached
                # Verify no transcription messages were sent (chunks too small)
                if mock_manager.send_message.called:
                    # If called, should not be transcription messages
                    call_args_list = mock_manager.send_message.call_args_list
                    for call_args in call_args_list:
                        message = call_args[0][1]
                        assert message["type"] != "transcription"

    @pytest.mark.unit
    @pytest.mark.streaming
    @pytest.mark.websocket
    @pytest.mark.asyncio
    async def test_websocket_with_large_audio_buffer(self):
        """Test WebSocket with very large audio buffer"""
        
        # Create large audio chunk (multiple seconds)
        large_chunk = bytes(16000 * 2 * 5)  # 5 seconds of audio
        
        mock_websocket = Mock()
        mock_websocket.accept = AsyncMock()
        mock_websocket.receive_bytes = AsyncMock(side_effect=[large_chunk, WebSocketDisconnect()])
        
        mock_stt_service = Mock()
        mock_stt_service.processor = Mock()
        mock_stt_service.model = Mock()
        
        from app.api.routes.streaming import websocket_transcribe
        
        with patch('app.api.routes.streaming.get_stt_service', return_value=mock_stt_service):
            with patch('app.api.routes.streaming.manager') as mock_manager:
                mock_manager.connect = AsyncMock()
                mock_manager.disconnect = Mock()
                mock_manager.send_message = AsyncMock()
                
                # Mock the transcription function to return success
                with patch('asyncio.get_event_loop') as mock_loop:
                    mock_executor = Mock()
                    mock_executor.run_in_executor = AsyncMock(return_value={
                        "transcription": "Large chunk processed",
                        "confidence": 0.9
                    })
                    mock_loop.return_value = mock_executor
                    
                    await websocket_transcribe(mock_websocket, "test_client")
                
                # Should process the large chunk in smaller segments
                # Verify at least one transcription message was sent
                mock_manager.send_message.assert_called()
                call_args_list = mock_manager.send_message.call_args_list
                transcription_calls = [call for call in call_args_list 
                                     if call[0][1]["type"] == "transcription"]
                assert len(transcription_calls) >= 1