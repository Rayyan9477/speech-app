# Legacy config file - replaced by app/core/config.py
# This file is kept for compatibility but all configuration 
# should now use the new settings system in app/core/config.py

import warnings
warnings.warn(
    "backend/config.py is deprecated. Use app.core.config.settings instead.",
    DeprecationWarning,
    stacklevel=2
)

from app.core.config import settings

# Backward compatibility aliases
class Config:
    SECRET_KEY = settings.SECRET_KEY
    UPLOAD_FOLDER = settings.UPLOAD_FOLDER
    MAX_CONTENT_LENGTH = settings.MAX_UPLOAD_SIZE
    ALLOWED_EXTENSIONS = settings.ALLOWED_AUDIO_EXTENSIONS