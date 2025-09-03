import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from loguru import logger
import sys

from .core.config import settings
from .database import get_database, get_vector_store
from .services import get_file_handler
from .api.routes import stt_router, tts_router, translation_router, voice_cloning_router, streaming
from .api.routes.auth import router as auth_router
from .security.middleware import (
    RateLimitMiddleware, SecurityHeadersMiddleware, 
    LoggingMiddleware, AuthenticationMiddleware
)


# Configure logging
logger.remove()  # Remove default handler
logger.add(
    sys.stderr,
    level=settings.LOG_LEVEL,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
)
logger.add(
    "logs/app.log",
    rotation="10 MB",
    retention="10 days",
    level=settings.LOG_LEVEL,
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # Create necessary directories
    directories = [
        settings.UPLOAD_FOLDER,
        settings.AUDIO_OUTPUT_FOLDER,
        settings.MODELS_CACHE_DIR,
        settings.CHROMADB_PATH,
        "logs",
        "voice_embeddings",
        "vectordb"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {directory}")
    
    # Initialize database connections
    try:
        db = get_database()
        vector_store = get_vector_store()
        logger.info("Database connections initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    # Initialize file handler
    try:
        file_handler = get_file_handler()
        logger.info("File handler initialized")
    except Exception as e:
        logger.error(f"File handler initialization failed: {e}")
        raise
    
    logger.info("Application startup completed successfully")
    
    yield  # Application runs here
    
    # Cleanup on shutdown
    logger.info("Application shutting down...")
    
    # Perform cleanup tasks
    try:
        file_handler = get_file_handler()
        cleaned = file_handler.cleanup_old_files(max_age_hours=24)
        logger.info(f"Cleaned up {cleaned} old files")
    except Exception as e:
        logger.warning(f"Cleanup failed: {e}")
    
    logger.info("Application shutdown completed")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Language Processor with Speech-to-Text, Text-to-Speech, Voice Cloning, and Translation capabilities",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Add security middleware (order matters)
app.add_middleware(LoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(AuthenticationMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=300)  # 100 requests per 5 minutes

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    stt_router, 
    prefix=f"{settings.API_PREFIX}/stt", 
    tags=["Speech-to-Text"]
)
app.include_router(
    tts_router, 
    prefix=f"{settings.API_PREFIX}/tts", 
    tags=["Text-to-Speech"]
)
app.include_router(
    translation_router, 
    prefix=f"{settings.API_PREFIX}/translate", 
    tags=["Translation"]
)
app.include_router(
    voice_cloning_router, 
    prefix=f"{settings.API_PREFIX}/voice", 
    tags=["Voice Cloning"]
)
app.include_router(
    streaming.router, 
    prefix=f"{settings.API_PREFIX}/stream", 
    tags=["Real-time Streaming"]
)
app.include_router(
    auth_router, 
    prefix=f"{settings.API_PREFIX}/auth", 
    tags=["Authentication"]
)

# Mount static files for audio serving
app.mount(
    "/audio", 
    StaticFiles(directory=settings.AUDIO_OUTPUT_FOLDER), 
    name="audio"
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_type": type(exc).__name__,
            "error_message": str(exc) if settings.DEBUG else "Internal server error"
        }
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "api_prefix": settings.API_PREFIX,
        "docs_url": "/docs",
        "endpoints": {
            "speech_to_text": f"{settings.API_PREFIX}/stt",
            "text_to_speech": f"{settings.API_PREFIX}/tts", 
            "translation": f"{settings.API_PREFIX}/translate",
            "voice_cloning": f"{settings.API_PREFIX}/voice"
        }
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Basic health checks
        db = get_database()
        vector_store = get_vector_store()
        
        return {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "timestamp": __import__('datetime').datetime.now().isoformat(),
            "services": {
                "database": "healthy",
                "vector_store": "healthy",
                "file_storage": "healthy"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=503, 
            detail={
                "status": "unhealthy",
                "error": str(e)
            }
        )

# API status endpoint
@app.get(f"{settings.API_PREFIX}/status")
async def api_status():
    """Detailed API status with service information"""
    try:
        return {
            "api_version": settings.APP_VERSION,
            "api_prefix": settings.API_PREFIX,
            "services": {
                "speech_to_text": {
                    "model": settings.WHISPER_MODEL,
                    "status": "available"
                },
                "text_to_speech": {
                    "model": settings.TTS_MODEL,
                    "status": "available"
                },
                "translation": {
                    "models": ["nllb", "m2m", "aya"],
                    "status": "available"
                },
                "voice_cloning": {
                    "status": "available"
                }
            },
            "features": {
                "encryption": settings.ENCRYPT_AUDIO_FILES,
                "privacy_mode": True,
                "local_processing": True
            }
        }
    except Exception as e:
        logger.error(f"API status check failed: {e}")
        raise HTTPException(status_code=500, detail="API status check failed")