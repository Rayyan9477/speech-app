import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict
from loguru import logger


@dataclass
class AudioProcessingSession:
    id: Optional[str] = None
    user_id: Optional[str] = None
    original_filename: str = ""
    file_path: str = ""
    file_size: int = 0
    duration_seconds: Optional[float] = None
    transcription: Optional[str] = None
    translation: Optional[str] = None
    target_language: Optional[str] = None
    synthesized_audio_path: Optional[str] = None
    voice_clone_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class VoiceClone:
    id: str
    name: str
    sample_audio_path: str
    voice_embedding_path: str
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = None


class DatabaseManager:
    def __init__(self, db_path: str = "app_data.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_database()
    
    def _init_database(self):
        """Initialize database with required tables"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS audio_sessions (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        original_filename TEXT NOT NULL,
                        file_path TEXT NOT NULL,
                        file_size INTEGER,
                        duration_seconds REAL,
                        transcription TEXT,
                        translation TEXT,
                        target_language TEXT,
                        synthesized_audio_path TEXT,
                        voice_clone_id TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata TEXT
                    )
                """)
                
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS voice_clones (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        sample_audio_path TEXT NOT NULL,
                        voice_embedding_path TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        metadata TEXT
                    )
                """)
                
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_audio_sessions_created_at 
                    ON audio_sessions(created_at)
                """)
                
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_voice_clones_name 
                    ON voice_clones(name)
                """)
                
                conn.commit()
                logger.info(f"Database initialized at {self.db_path}")
                
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    def create_audio_session(self, session: AudioProcessingSession) -> str:
        """Create new audio processing session"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                session.created_at = datetime.now()
                session.updated_at = datetime.now()
                
                if not session.id:
                    import uuid
                    session.id = str(uuid.uuid4())
                
                metadata_json = json.dumps(session.metadata) if session.metadata else None
                
                conn.execute("""
                    INSERT INTO audio_sessions 
                    (id, user_id, original_filename, file_path, file_size, duration_seconds,
                     transcription, translation, target_language, synthesized_audio_path,
                     voice_clone_id, created_at, updated_at, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    session.id, session.user_id, session.original_filename,
                    session.file_path, session.file_size, session.duration_seconds,
                    session.transcription, session.translation, session.target_language,
                    session.synthesized_audio_path, session.voice_clone_id,
                    session.created_at, session.updated_at, metadata_json
                ))
                
                conn.commit()
                logger.info(f"Audio session created: {session.id}")
                return session.id
                
        except Exception as e:
            logger.error(f"Failed to create audio session: {e}")
            raise
    
    def get_audio_session(self, session_id: str) -> Optional[AudioProcessingSession]:
        """Get audio session by ID"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute(
                    "SELECT * FROM audio_sessions WHERE id = ?", (session_id,)
                )
                row = cursor.fetchone()
                
                if row:
                    metadata = json.loads(row['metadata']) if row['metadata'] else None
                    return AudioProcessingSession(
                        id=row['id'],
                        user_id=row['user_id'],
                        original_filename=row['original_filename'],
                        file_path=row['file_path'],
                        file_size=row['file_size'],
                        duration_seconds=row['duration_seconds'],
                        transcription=row['transcription'],
                        translation=row['translation'],
                        target_language=row['target_language'],
                        synthesized_audio_path=row['synthesized_audio_path'],
                        voice_clone_id=row['voice_clone_id'],
                        created_at=datetime.fromisoformat(row['created_at']),
                        updated_at=datetime.fromisoformat(row['updated_at']),
                        metadata=metadata
                    )
                return None
                
        except Exception as e:
            logger.error(f"Failed to get audio session {session_id}: {e}")
            return None
    
    def update_audio_session(self, session: AudioProcessingSession):
        """Update existing audio session"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                session.updated_at = datetime.now()
                metadata_json = json.dumps(session.metadata) if session.metadata else None
                
                conn.execute("""
                    UPDATE audio_sessions SET
                    transcription = ?, translation = ?, target_language = ?,
                    synthesized_audio_path = ?, voice_clone_id = ?,
                    updated_at = ?, metadata = ?
                    WHERE id = ?
                """, (
                    session.transcription, session.translation, session.target_language,
                    session.synthesized_audio_path, session.voice_clone_id,
                    session.updated_at, metadata_json, session.id
                ))
                
                conn.commit()
                logger.info(f"Audio session updated: {session.id}")
                
        except Exception as e:
            logger.error(f"Failed to update audio session {session.id}: {e}")
            raise


# Global database manager instance
_db_manager: Optional[DatabaseManager] = None

def get_database() -> DatabaseManager:
    """Get or create global database manager instance"""
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager()
    return _db_manager