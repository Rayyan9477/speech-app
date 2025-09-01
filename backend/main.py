"""
Main entry point for the AI Language Processor backend application.
"""

import uvicorn
from app.app import app
from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
        use_colors=True,
        reload_dirs=["app"] if settings.DEBUG else None
    )