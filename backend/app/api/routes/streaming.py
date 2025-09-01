from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import StreamingResponse
import json
import asyncio
from typing import Dict, Any
from loguru import logger
import io
import wave
import numpy as np

from ...services import get_stt_service
from ...core.config import settings


router = APIRouter()


class ConnectionManager:
    """Manage WebSocket connections for real-time transcription"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected for real-time transcription")
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected")
    
    async def send_message(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_text(json.dumps(message))


manager = ConnectionManager()


@router.websocket("/ws/transcribe/{client_id}")
async def websocket_transcribe(websocket: WebSocket, client_id: str):
    """
    Real-time speech-to-text transcription via WebSocket
    
    Expected audio format: 16kHz, 16-bit, mono PCM
    Sends partial and final transcription results
    """
    await manager.connect(websocket, client_id)
    stt_service = get_stt_service()
    
    # Ensure model is loaded
    if stt_service.processor is None or stt_service.model is None:
        stt_service.load_model()
    
    audio_buffer = bytearray()
    chunk_size = 16000 * 2  # 1 second of 16kHz 16-bit audio
    
    try:
        while True:
            # Receive audio data
            data = await websocket.receive_bytes()
            audio_buffer.extend(data)
            
            # Process audio in chunks for real-time transcription
            if len(audio_buffer) >= chunk_size:
                chunk = bytes(audio_buffer[:chunk_size])
                audio_buffer = audio_buffer[chunk_size:]
                
                try:
                    # Convert audio bytes to numpy array
                    audio_array = np.frombuffer(chunk, dtype=np.int16).astype(np.float32) / 32768.0
                    
                    # Transcribe chunk
                    result = await asyncio.get_event_loop().run_in_executor(
                        None, 
                        _transcribe_chunk, 
                        stt_service, 
                        audio_array
                    )
                    
                    # Send result back to client
                    await manager.send_message(client_id, {
                        "type": "transcription",
                        "text": result.get("transcription", ""),
                        "is_final": False,
                        "confidence": result.get("confidence", 1.0),
                        "timestamp": result.get("timestamp", None)
                    })
                    
                except Exception as e:
                    logger.error(f"Transcription error: {e}")
                    await manager.send_message(client_id, {
                        "type": "error",
                        "message": f"Transcription failed: {str(e)}"
                    })
    
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(client_id)


def _transcribe_chunk(stt_service, audio_array: np.ndarray) -> Dict[str, Any]:
    """Transcribe audio chunk (runs in thread pool)"""
    try:
        import torch
        
        # Prepare inputs for Whisper
        inputs = stt_service.processor(
            audio_array,
            sampling_rate=16000,
            return_tensors="pt"
        ).to(stt_service.device)
        
        # Generate transcription
        with torch.no_grad():
            generated_ids = stt_service.model.generate(
                inputs.input_features,
                max_new_tokens=100,  # Smaller for real-time
                do_sample=False,
                use_cache=True,
                return_timestamps=True
            )
        
        # Decode result
        transcription = stt_service.processor.batch_decode(
            generated_ids, 
            skip_special_tokens=True
        )[0]
        
        return {
            "transcription": transcription.strip(),
            "confidence": 1.0,
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Chunk transcription failed: {e}")
        return {
            "transcription": "",
            "confidence": 0.0,
            "error": str(e)
        }


@router.get("/stream/transcribe")
async def stream_transcription_status():
    """Get real-time transcription service status"""
    return {
        "service": "Real-time STT",
        "active_connections": len(manager.active_connections),
        "supported_sample_rate": 16000,
        "supported_format": "16-bit PCM mono",
        "chunk_duration": "1 second"
    }


@router.post("/stream/test")
async def test_streaming():
    """Test endpoint for streaming functionality"""
    stt_service = get_stt_service()
    
    try:
        # Test if model can be loaded
        if stt_service.processor is None or stt_service.model is None:
            stt_service.load_model()
        
        return {
            "streaming_ready": True,
            "model_loaded": True,
            "websocket_endpoint": "/api/v1/stream/ws/transcribe/{client_id}",
            "test_status": "OK"
        }
    except Exception as e:
        return {
            "streaming_ready": False,
            "model_loaded": False,
            "error": str(e),
            "test_status": "FAILED"
        }