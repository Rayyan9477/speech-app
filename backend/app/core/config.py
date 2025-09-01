import os
from typing import Optional, List

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "AI Language Processor"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    
    # API settings
    API_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # File handling
    UPLOAD_FOLDER: str = "uploads"
    AUDIO_OUTPUT_FOLDER: str = "audio_outputs" 
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_AUDIO_EXTENSIONS: set = {"wav", "mp3", "ogg", "m4a", "flac"}
    
    # Model settings
    MODELS_CACHE_DIR: str = "models_cache"
    WHISPER_MODEL: str = "openai/whisper-large-v3-turbo"
    TTS_MODEL: str = "nari-labs/dia-1.6b"  # According to plan
    
    # Database
    CHROMADB_PATH: str = "vectordb"
    SQLITE_DB_PATH: str = "app_data.db"
    
    # Privacy and security
    ENCRYPT_AUDIO_FILES: bool = True
    ENCRYPTION_KEY: Optional[str] = None
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()