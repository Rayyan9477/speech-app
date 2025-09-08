import os
from typing import Optional, List
import secrets
import warnings

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "case_sensitive": True}
    # Application settings
    APP_NAME: str = "AI Language Processor"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False

    # API settings
    API_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    # Security
    SECRET_KEY: Optional[str] = os.getenv("SECRET_KEY", None)
    JWT_SECRET_KEY: Optional[str] = os.getenv("JWT_SECRET_KEY", None)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ENCRYPTION_KEY: Optional[str] = os.getenv("ENCRYPTION_KEY", None)

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
    LOG_LEVEL: str = "INFO"

    def model_post_init(self, __context):
        """Validate security configuration."""
        # Generate secure keys if not provided
        if not self.SECRET_KEY:
            self.SECRET_KEY = secrets.token_urlsafe(32)
            warnings.warn("SECRET_KEY not set, using generated key. Set SECRET_KEY environment variable for production!")

        if not self.JWT_SECRET_KEY:
            self.JWT_SECRET_KEY = secrets.token_urlsafe(32)
            warnings.warn("JWT_SECRET_KEY not set, using generated key. Set JWT_SECRET_KEY environment variable for production!")

        if not self.ENCRYPTION_KEY:
            self.ENCRYPTION_KEY = secrets.token_urlsafe(32)
            warnings.warn("ENCRYPTION_KEY not set, using generated key. Set ENCRYPTION_KEY environment variable for production!")

        # Validate key lengths
        if len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        if len(self.JWT_SECRET_KEY) < 32:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters long")
        if len(self.ENCRYPTION_KEY) < 32:
            raise ValueError("ENCRYPTION_KEY must be at least 32 characters long")
    


settings = Settings()