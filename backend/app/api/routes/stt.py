from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
from loguru import logger

from ...services import get_stt_service, get_file_handler
from ...database import get_database, AudioProcessingSession


router = APIRouter()


class TranscriptionResponse(BaseModel):
    transcription: str
    language: str
    confidence: float
    duration_seconds: float
    model: str
    session_id: str


class TimestampedTranscriptionResponse(BaseModel):
    transcription: str
    language: str
    segments: list
    model: str
    session_id: str


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: Optional[str] = None,
    task: str = "transcribe"
):
    """
    Transcribe audio file to text using Whisper Large V3 Turbo
    
    Args:
        file: Audio file (wav, mp3, ogg, m4a, flac)
        language: Source language (optional, auto-detect if None)
        task: 'transcribe' or 'translate' to English
    """
    stt_service = get_stt_service()
    file_handler = get_file_handler()
    db = get_database()
    
    try:
        # Save uploaded file
        file_info = await file_handler.save_upload_file(file, subfolder="stt_input")
        
        # Create database session
        session = AudioProcessingSession(
            original_filename=file_info["original_filename"],
            file_path=file_info["file_path"],
            file_size=file_info["file_size"]
        )
        session_id = db.create_audio_session(session)
        
        # Transcribe audio
        transcription_result = stt_service.transcribe_audio(
            audio_path=file_info["file_path"],
            language=language,
            task=task
        )
        
        # Update session with results
        session.transcription = transcription_result["transcription"]
        session.duration_seconds = transcription_result["audio_duration"]
        db.update_audio_session(session)
        
        # Schedule cleanup
        background_tasks.add_task(
            file_handler.delete_file, 
            file_info["filename"], 
            "stt_input"
        )
        
        response = TranscriptionResponse(
            transcription=transcription_result["transcription"],
            language=transcription_result["language"],
            confidence=transcription_result["confidence"],
            duration_seconds=transcription_result["audio_duration"],
            model=transcription_result["model"],
            session_id=session_id
        )
        
        logger.info(f"Transcription completed for session {session_id}")
        return response
        
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/transcribe-with-timestamps", response_model=TimestampedTranscriptionResponse)
async def transcribe_with_timestamps(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: Optional[str] = None
):
    """
    Transcribe audio with word-level timestamps
    """
    stt_service = get_stt_service()
    file_handler = get_file_handler()
    db = get_database()
    
    try:
        # Save uploaded file
        file_info = await file_handler.save_upload_file(file, subfolder="stt_input")
        
        # Create database session
        session = AudioProcessingSession(
            original_filename=file_info["original_filename"],
            file_path=file_info["file_path"],
            file_size=file_info["file_size"]
        )
        session_id = db.create_audio_session(session)
        
        # Transcribe with timestamps
        result = stt_service.transcribe_with_timestamps(
            audio_path=file_info["file_path"],
            language=language
        )
        
        # Update session
        session.transcription = result["transcription"]
        db.update_audio_session(session)
        
        # Schedule cleanup
        background_tasks.add_task(
            file_handler.delete_file, 
            file_info["filename"], 
            "stt_input"
        )
        
        response = TimestampedTranscriptionResponse(
            transcription=result["transcription"],
            language=result["language"],
            segments=result["segments"],
            model=result["model"],
            session_id=session_id
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Timestamped transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/detect-language")
async def detect_language(file: UploadFile = File(...)):
    """
    Detect the language of an audio file
    """
    stt_service = get_stt_service()
    file_handler = get_file_handler()
    
    try:
        # Save uploaded file temporarily
        file_info = await file_handler.save_upload_file(file, subfolder="temp")
        
        # Detect language
        detected_language = stt_service.detect_language(file_info["file_path"])
        
        # Clean up
        file_handler.delete_file(file_info["filename"], "temp")
        
        return {"detected_language": detected_language}
        
    except Exception as e:
        logger.error(f"Language detection failed: {e}")
        raise HTTPException(status_code=500, detail=f"Language detection failed: {str(e)}")


@router.get("/session/{session_id}")
async def get_transcription_session(session_id: str):
    """Get transcription session details"""
    db = get_database()
    
    try:
        session = db.get_audio_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session.id,
            "original_filename": session.original_filename,
            "transcription": session.transcription,
            "duration_seconds": session.duration_seconds,
            "created_at": session.created_at.isoformat() if session.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve session")