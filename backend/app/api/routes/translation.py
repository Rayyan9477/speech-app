from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from loguru import logger

from ...services import get_translation_service
from ...database import get_database, AudioProcessingSession


router = APIRouter()


class TranslationRequest(BaseModel):
    text: str
    source_language: str
    target_language: str
    model_type: str = "nllb"


class TranslationResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
    original_text: str
    model: str
    confidence: float
    session_id: Optional[str] = None


class BatchTranslationRequest(BaseModel):
    texts: List[str]
    source_language: str
    target_language: str
    model_type: str = "nllb"


class LanguageDetectionRequest(BaseModel):
    text: str


class SupportedLanguagesResponse(BaseModel):
    nllb: List[str]
    m2m: List[str]
    aya: List[str]


@router.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate text using open-source translation models
    
    Args:
        request: Translation request with text, source/target languages, and model type
    """
    translation_service = get_translation_service()
    db = get_database()
    
    try:
        # Validate input
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        if len(request.text) > 10000:
            raise HTTPException(status_code=400, detail="Text too long (max 10000 characters)")
        
        # Validate model type
        if request.model_type not in ["nllb", "m2m", "aya"]:
            raise HTTPException(status_code=400, detail="Invalid model type")
        
        # Create session (optional for translation)
        session = AudioProcessingSession(
            original_filename="translation_request.txt",
            file_path="",
            file_size=len(request.text.encode())
        )
        session_id = db.create_audio_session(session)
        
        # Perform translation
        translation_result = translation_service.translate_text(
            text=request.text,
            source_language=request.source_language,
            target_language=request.target_language,
            model_type=request.model_type
        )
        
        # Update session
        session.translation = translation_result["translated_text"]
        session.target_language = request.target_language
        db.update_audio_session(session)
        
        response = TranslationResponse(
            translated_text=translation_result["translated_text"],
            source_language=translation_result["source_language"],
            target_language=translation_result["target_language"],
            original_text=translation_result["original_text"],
            model=translation_result["model"],
            confidence=translation_result["confidence"],
            session_id=session_id
        )
        
        logger.info(f"Translation completed: {request.source_language} -> {request.target_language}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.post("/translate-batch")
async def translate_batch(request: BatchTranslationRequest):
    """
    Translate multiple texts in batch
    """
    if len(request.texts) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 texts per batch")
    
    translation_service = get_translation_service()
    results = []
    
    try:
        for i, text in enumerate(request.texts):
            try:
                if not text.strip():
                    results.append({
                        "index": i,
                        "status": "error",
                        "error": "Empty text"
                    })
                    continue
                
                result = translation_service.translate_text(
                    text=text,
                    source_language=request.source_language,
                    target_language=request.target_language,
                    model_type=request.model_type
                )
                
                results.append({
                    "index": i,
                    "status": "success",
                    "result": {
                        "translated_text": result["translated_text"],
                        "original_text": result["original_text"]
                    }
                })
                
            except Exception as e:
                results.append({
                    "index": i,
                    "status": "error",
                    "error": str(e)
                })
        
        return {"batch_results": results}
        
    except Exception as e:
        logger.error(f"Batch translation failed: {e}")
        raise HTTPException(status_code=500, detail="Batch translation failed")


@router.post("/detect-language")
async def detect_text_language(request: LanguageDetectionRequest):
    """
    Detect the language of input text
    """
    translation_service = get_translation_service()
    
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        detected_language = translation_service.detect_language(request.text)
        
        return {
            "detected_language": detected_language,
            "text": request.text[:100] + "..." if len(request.text) > 100 else request.text
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Language detection failed: {e}")
        raise HTTPException(status_code=500, detail=f"Language detection failed: {str(e)}")


@router.get("/supported-languages", response_model=SupportedLanguagesResponse)
async def get_supported_languages():
    """
    Get supported languages for each translation model
    """
    try:
        translation_service = get_translation_service()
        supported_languages = translation_service.get_supported_languages()
        
        return SupportedLanguagesResponse(**supported_languages)
        
    except Exception as e:
        logger.error(f"Failed to get supported languages: {e}")
        raise HTTPException(status_code=500, detail="Failed to get supported languages")


@router.post("/translate-with-context")
async def translate_with_context(
    text: str,
    source_language: str,
    target_language: str,
    context: Optional[str] = None,
    domain: Optional[str] = None,
    model_type: str = "nllb"
):
    """
    Translate text with additional context for better accuracy
    
    Args:
        text: Text to translate
        source_language: Source language code
        target_language: Target language code
        context: Additional context to improve translation
        domain: Domain/topic (technical, medical, legal, etc.)
        model_type: Translation model to use
    """
    translation_service = get_translation_service()
    
    try:
        # Prepare enhanced text with context
        enhanced_text = text
        if context:
            enhanced_text = f"Context: {context}\n\nText to translate: {text}"
        
        if domain:
            enhanced_text = f"Domain: {domain}\n{enhanced_text}"
        
        # Perform translation
        result = translation_service.translate_text(
            text=enhanced_text,
            source_language=source_language,
            target_language=target_language,
            model_type=model_type
        )
        
        # Extract the translated text (remove context if it was added)
        translated_text = result["translated_text"]
        if context or domain:
            # Try to extract just the translated part
            lines = translated_text.split('\n')
            if len(lines) > 1:
                translated_text = lines[-1]  # Take the last line as the translation
        
        return {
            "translated_text": translated_text,
            "source_language": source_language,
            "target_language": target_language,
            "original_text": text,
            "context": context,
            "domain": domain,
            "model": result["model"]
        }
        
    except Exception as e:
        logger.error(f"Context-aware translation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.get("/session/{session_id}")
async def get_translation_session(session_id: str):
    """Get translation session details"""
    db = get_database()
    
    try:
        session = db.get_audio_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session.id,
            "translation": session.translation,
            "target_language": session.target_language,
            "created_at": session.created_at.isoformat() if session.created_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get translation session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve session")