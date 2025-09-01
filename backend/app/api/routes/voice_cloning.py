from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from loguru import logger

from ...services import get_voice_cloning_service, get_file_handler
from ...database import get_database


router = APIRouter()


class VoiceCloneRequest(BaseModel):
    name: str
    user_id: Optional[str] = None


class VoiceCloneResponse(BaseModel):
    clone_id: str
    name: str
    status: str
    embedding_path: str
    embedding_dimensions: int
    sample_path: str


class VoiceSynthesisRequest(BaseModel):
    text: str
    clone_id: str
    language: str = "en"


class VoiceSynthesisResponse(BaseModel):
    audio_path: str
    clone_id: str
    text: str
    language: str
    duration: float
    sample_rate: int


class SimilarVoicesResponse(BaseModel):
    similar_voices: List[Dict[str, Any]]


@router.post("/create-clone", response_model=VoiceCloneResponse)
async def create_voice_clone(
    background_tasks: BackgroundTasks,
    name: str,
    user_id: Optional[str] = None,
    file: UploadFile = File(...)
):
    """
    Create a new voice clone from audio sample
    
    Args:
        name: Name for the voice clone
        user_id: Optional user identifier
        file: Audio sample file for voice cloning
    """
    voice_service = get_voice_cloning_service()
    file_handler = get_file_handler()
    
    try:
        # Validate input
        if not name.strip():
            raise HTTPException(status_code=400, detail="Voice clone name cannot be empty")
        
        if len(name) > 100:
            raise HTTPException(status_code=400, detail="Name too long (max 100 characters)")
        
        # Save audio sample
        file_info = await file_handler.save_upload_file(file, subfolder="voice_samples")
        
        # Create voice clone
        clone_result = voice_service.create_voice_clone(
            name=name,
            sample_audio_path=file_info["file_path"],
            user_id=user_id
        )
        
        # Schedule cleanup of original sample (keep the processed version)
        background_tasks.add_task(
            lambda: logger.info(f"Voice clone {clone_result['clone_id']} created successfully")
        )
        
        response = VoiceCloneResponse(
            clone_id=clone_result["clone_id"],
            name=clone_result["name"],
            status=clone_result["status"],
            embedding_path=clone_result["embedding_path"],
            embedding_dimensions=clone_result["embedding_dimensions"],
            sample_path=clone_result["sample_path"]
        )
        
        logger.info(f"Voice clone created: {name} ({clone_result['clone_id']})")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Voice clone creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Voice clone creation failed: {str(e)}")


@router.post("/synthesize", response_model=VoiceSynthesisResponse)
async def synthesize_with_cloned_voice(request: VoiceSynthesisRequest):
    """
    Synthesize speech using a cloned voice
    
    Args:
        request: Synthesis request with text, clone ID, and language
    """
    voice_service = get_voice_cloning_service()
    
    try:
        # Validate input
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        if len(request.text) > 5000:
            raise HTTPException(status_code=400, detail="Text too long (max 5000 characters)")
        
        # Synthesize with cloned voice
        synthesis_result = voice_service.synthesize_with_cloned_voice(
            text=request.text,
            clone_id=request.clone_id,
            language=request.language
        )
        
        response = VoiceSynthesisResponse(
            audio_path=synthesis_result["audio_path"],
            clone_id=synthesis_result["clone_id"],
            text=synthesis_result["text"],
            language=synthesis_result["language"],
            duration=synthesis_result["duration"],
            sample_rate=synthesis_result["sample_rate"]
        )
        
        logger.info(f"Speech synthesized with cloned voice: {request.clone_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cloned voice synthesis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {str(e)}")


@router.get("/list")
async def list_voice_clones(user_id: Optional[str] = None):
    """
    List available voice clones
    
    Args:
        user_id: Optional filter by user ID
    """
    voice_service = get_voice_cloning_service()
    
    try:
        clones = voice_service.list_voice_clones(user_id=user_id)
        
        return {
            "voice_clones": clones,
            "total": len(clones)
        }
        
    except Exception as e:
        logger.error(f"Failed to list voice clones: {e}")
        raise HTTPException(status_code=500, detail="Failed to list voice clones")


@router.get("/similar/{clone_id}", response_model=SimilarVoicesResponse)
async def find_similar_voices(clone_id: str, n_results: int = 5):
    """
    Find voices similar to the specified clone
    
    Args:
        clone_id: ID of the voice clone to find similar voices for
        n_results: Number of similar voices to return (max 10)
    """
    voice_service = get_voice_cloning_service()
    
    try:
        if n_results > 10:
            n_results = 10
        
        similar_voices = voice_service.find_similar_voices(
            clone_id=clone_id,
            n_results=n_results
        )
        
        # Format response
        formatted_voices = []
        for i, voice_id in enumerate(similar_voices['ids']):
            formatted_voices.append({
                "clone_id": voice_id,
                "similarity_distance": similar_voices['distances'][i],
                "metadata": similar_voices['metadatas'][i]
            })
        
        response = SimilarVoicesResponse(similar_voices=formatted_voices)
        return response
        
    except Exception as e:
        logger.error(f"Similar voice search failed: {e}")
        raise HTTPException(status_code=500, detail="Similar voice search failed")


@router.delete("/{clone_id}")
async def delete_voice_clone(clone_id: str):
    """
    Delete a voice clone
    
    Args:
        clone_id: ID of the voice clone to delete
    """
    voice_service = get_voice_cloning_service()
    
    try:
        success = voice_service.delete_voice_clone(clone_id)
        
        if success:
            return {"message": f"Voice clone {clone_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Voice clone not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Voice clone deletion failed: {e}")
        raise HTTPException(status_code=500, detail="Voice clone deletion failed")


@router.get("/{clone_id}/info")
async def get_voice_clone_info(clone_id: str):
    """
    Get detailed information about a voice clone
    """
    voice_service = get_voice_cloning_service()
    
    try:
        # This would retrieve detailed clone information
        # For now, return basic info
        clones = voice_service.list_voice_clones()
        clone_info = None
        
        for clone in clones:
            if clone.get('clone_id') == clone_id:
                clone_info = clone
                break
        
        if not clone_info:
            raise HTTPException(status_code=404, detail="Voice clone not found")
        
        return clone_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get voice clone info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get voice clone info")


@router.post("/extract-embedding")
async def extract_voice_embedding(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Extract voice embedding from audio sample (for analysis/testing)
    
    Args:
        file: Audio file to extract embedding from
    """
    voice_service = get_voice_cloning_service()
    file_handler = get_file_handler()
    
    try:
        # Save uploaded file temporarily
        file_info = await file_handler.save_upload_file(file, subfolder="temp")
        
        # Extract embedding
        embedding = voice_service.extract_voice_embedding(file_info["file_path"])
        
        # Schedule cleanup
        background_tasks.add_task(
            file_handler.delete_file,
            file_info["filename"], 
            "temp"
        )
        
        return {
            "embedding_dimensions": len(embedding),
            "embedding_stats": {
                "mean": float(embedding.mean()),
                "std": float(embedding.std()),
                "min": float(embedding.min()),
                "max": float(embedding.max())
            },
            "message": "Voice embedding extracted successfully"
        }
        
    except Exception as e:
        logger.error(f"Voice embedding extraction failed: {e}")
        raise HTTPException(status_code=500, detail="Voice embedding extraction failed")