from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from loguru import logger

from ...services import get_tts_service
from ...database import get_database, AudioProcessingSession


router = APIRouter()


class SynthesisRequest(BaseModel):
    text: str
    language: str = "en"
    voice_style: str = "neutral"
    emotion: str = "neutral"
    speed: float = 1.0
    pitch: float = 1.0


class SynthesisResponse(BaseModel):
    audio_path: str
    filename: str
    text: str
    language: str
    voice_style: str
    emotion: str
    duration_seconds: float
    sample_rate: int
    model: str
    encrypted: bool
    session_id: str


class VoiceStylesResponse(BaseModel):
    voice_styles: List[str]
    emotions: List[str]
    languages: List[str]


@router.post("/synthesize", response_model=SynthesisResponse)
async def synthesize_speech(request: SynthesisRequest):
    """
    Synthesize speech from text using Dia TTS with emotional control
    
    Args:
        request: Synthesis parameters including text, language, style, emotion
    """
    tts_service = get_tts_service()
    db = get_database()
    
    try:
        # Validate input
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        if len(request.text) > 5000:
            raise HTTPException(status_code=400, detail="Text too long (max 5000 characters)")
        
        # Validate parameters
        if request.speed < 0.5 or request.speed > 2.0:
            raise HTTPException(status_code=400, detail="Speed must be between 0.5 and 2.0")
        
        if request.pitch < 0.5 or request.pitch > 2.0:
            raise HTTPException(status_code=400, detail="Pitch must be between 0.5 and 2.0")
        
        # Create session
        session = AudioProcessingSession(
            original_filename="synthesized_speech.wav",
            file_path="",
            file_size=0
        )
        session_id = db.create_audio_session(session)
        
        # Synthesize speech
        synthesis_result = tts_service.synthesize_speech(
            text=request.text,
            language=request.language,
            voice_style=request.voice_style,
            emotion=request.emotion,
            speed=request.speed,
            pitch=request.pitch
        )
        
        # Update session
        session.synthesized_audio_path = synthesis_result["audio_path"]
        session.file_size = 0  # Would calculate actual size
        db.update_audio_session(session)
        
        response = SynthesisResponse(
            audio_path=synthesis_result["audio_path"],
            filename=synthesis_result["filename"],
            text=synthesis_result["text"],
            language=synthesis_result["language"],
            voice_style=synthesis_result["voice_style"],
            emotion=synthesis_result["emotion"],
            duration_seconds=synthesis_result["duration_seconds"],
            sample_rate=synthesis_result["sample_rate"],
            model=synthesis_result["model"],
            encrypted=synthesis_result["encrypted"],
            session_id=session_id
        )
        
        logger.info(f"Speech synthesis completed for session {session_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Speech synthesis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")


@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """
    Serve synthesized audio file
    """
    try:
        from ...services import get_file_handler
        file_handler = get_file_handler()
        
        # Get audio file path
        audio_path = file_handler.audio_output_folder / filename
        
        # Check if encrypted version exists
        encrypted_path = audio_path.with_suffix(audio_path.suffix + '.encrypted')
        
        if encrypted_path.exists():
            # Decrypt and serve
            content = file_handler.get_file_content(filename.replace('.encrypted', ''))
            if content is None:
                raise HTTPException(status_code=404, detail="Audio file not found")
            
            return Response(
                content=content,
                media_type="audio/wav",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        
        elif audio_path.exists():
            # Serve unencrypted file
            return FileResponse(
                path=str(audio_path),
                media_type="audio/wav",
                filename=filename
            )
        
        else:
            raise HTTPException(status_code=404, detail="Audio file not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to serve audio file {filename}: {e}")
        raise HTTPException(status_code=500, detail="Failed to serve audio file")


@router.get("/voices", response_model=VoiceStylesResponse)
async def get_available_voices():
    """
    Get available voice styles, emotions, and languages
    """
    try:
        tts_service = get_tts_service()
        voices = tts_service.get_available_voices()
        
        return VoiceStylesResponse(**voices)
        
    except Exception as e:
        logger.error(f"Failed to get available voices: {e}")
        raise HTTPException(status_code=500, detail="Failed to get available voices")


@router.post("/synthesize-batch")
async def synthesize_batch(texts: List[SynthesisRequest]):
    """
    Synthesize multiple texts in batch
    """
    if len(texts) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 texts per batch")
    
    tts_service = get_tts_service()
    results = []
    
    try:
        for i, request in enumerate(texts):
            try:
                result = tts_service.synthesize_speech(
                    text=request.text,
                    language=request.language,
                    voice_style=request.voice_style,
                    emotion=request.emotion,
                    speed=request.speed,
                    pitch=request.pitch
                )
                results.append({
                    "index": i,
                    "status": "success",
                    "result": result
                })
            except Exception as e:
                results.append({
                    "index": i,
                    "status": "error",
                    "error": str(e)
                })
        
        return {"batch_results": results}
        
    except Exception as e:
        logger.error(f"Batch synthesis failed: {e}")
        raise HTTPException(status_code=500, detail="Batch synthesis failed")


@router.get("/session/{session_id}")
async def get_synthesis_session(session_id: str):
    """Get synthesis session details"""
    db = get_database()
    
    try:
        session = db.get_audio_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session.id,
            "synthesized_audio_path": session.synthesized_audio_path,
            "created_at": session.created_at.isoformat() if session.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get synthesis session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve session")