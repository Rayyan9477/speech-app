import os
import uuid
import hashlib
from pathlib import Path
from typing import Optional, Dict, Any, List, Union
from datetime import datetime, timedelta
import aiofiles
from fastapi import UploadFile, HTTPException
from loguru import logger

from ..core.config import settings
from ..security import get_encryption


class FileHandlerService:
    """Secure file handling service with encryption support"""
    
    def __init__(self):
        self.upload_folder = Path(settings.UPLOAD_FOLDER)
        self.audio_output_folder = Path(settings.AUDIO_OUTPUT_FOLDER)
        self.max_file_size = settings.MAX_UPLOAD_SIZE
        self.allowed_extensions = settings.ALLOWED_AUDIO_EXTENSIONS
        self.encryption = get_encryption() if settings.ENCRYPT_AUDIO_FILES else None
        
        # Ensure directories exist
        self.upload_folder.mkdir(parents=True, exist_ok=True)
        self.audio_output_folder.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"FileHandlerService initialized with encryption: {self.encryption is not None}")
    
    def is_allowed_file(self, filename: str) -> bool:
        """Check if file extension is allowed"""
        if not filename:
            return False
        
        file_ext = Path(filename).suffix.lower().lstrip('.')
        return file_ext in self.allowed_extensions
    
    def generate_secure_filename(self, original_filename: str) -> str:
        """Generate secure filename with UUID prefix"""
        if not original_filename:
            original_filename = "unnamed_file"
        
        # Extract extension
        file_path = Path(original_filename)
        extension = file_path.suffix.lower()
        
        # Generate UUID-based name
        unique_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create safe base name
        safe_base = self._sanitize_filename(file_path.stem)
        
        return f"{unique_id}_{timestamp}_{safe_base}{extension}"
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename by removing dangerous characters"""
        # Remove or replace dangerous characters
        dangerous_chars = '<>:"/\\|?*'
        for char in dangerous_chars:
            filename = filename.replace(char, '_')
        
        # Remove control characters
        filename = ''.join(char for char in filename if ord(char) >= 32)
        
        # Limit length
        return filename[:50] if len(filename) > 50 else filename
    
    async def save_upload_file(
        self, 
        file: UploadFile, 
        subfolder: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Save uploaded file securely
        
        Args:
            file: FastAPI UploadFile object
            subfolder: Optional subfolder within upload directory
        
        Returns:
            Dictionary with file information
        """
        try:
            # Validate file
            if not self.is_allowed_file(file.filename):
                raise HTTPException(
                    status_code=400, 
                    detail=f"File type not allowed. Allowed: {', '.join(self.allowed_extensions)}"
                )
            
            # Check file size
            if file.size and file.size > self.max_file_size:
                raise HTTPException(
                    status_code=413, 
                    detail=f"File too large. Max size: {self.max_file_size / (1024*1024):.1f} MB"
                )
            
            # Generate secure filename
            secure_filename = self.generate_secure_filename(file.filename)
            
            # Determine save path
            save_dir = self.upload_folder
            if subfolder:
                save_dir = save_dir / subfolder
                save_dir.mkdir(parents=True, exist_ok=True)
            
            file_path = save_dir / secure_filename
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Get file info
            file_size = len(content)
            file_hash = hashlib.sha256(content).hexdigest()
            
            # Encrypt if required
            final_path = str(file_path)
            if self.encryption:
                encrypted_path = str(file_path) + '.encrypted'
                self.encryption.encrypt_file(str(file_path), encrypted_path)
                file_path.unlink()  # Remove unencrypted file
                final_path = encrypted_path
            
            result = {
                "filename": secure_filename,
                "original_filename": file.filename,
                "file_path": final_path,
                "file_size": file_size,
                "file_hash": file_hash,
                "content_type": file.content_type,
                "encrypted": self.encryption is not None,
                "upload_time": datetime.now().isoformat()
            }
            
            logger.info(f"File uploaded: {file.filename} -> {secure_filename}")
            return result
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            raise HTTPException(status_code=500, detail="File upload failed")
    
    def get_file_path(self, filename: str, subfolder: Optional[str] = None) -> Path:
        """Get full path for a file"""
        base_dir = self.upload_folder
        if subfolder:
            base_dir = base_dir / subfolder
        
        return base_dir / filename
    
    def file_exists(self, filename: str, subfolder: Optional[str] = None) -> bool:
        """Check if file exists"""
        file_path = self.get_file_path(filename, subfolder)
        return file_path.exists() or Path(str(file_path) + '.encrypted').exists()
    
    def delete_file(self, filename: str, subfolder: Optional[str] = None) -> bool:
        """Delete a file"""
        try:
            file_path = self.get_file_path(filename, subfolder)
            
            # Try to delete both encrypted and unencrypted versions
            deleted = False
            
            if file_path.exists():
                file_path.unlink()
                deleted = True
            
            encrypted_path = Path(str(file_path) + '.encrypted')
            if encrypted_path.exists():
                encrypted_path.unlink()
                deleted = True
            
            if deleted:
                logger.info(f"File deleted: {filename}")
            
            return deleted
            
        except Exception as e:
            logger.error(f"File deletion failed: {e}")
            return False
    
    def cleanup_old_files(self, max_age_hours: int = 24) -> int:
        """Clean up old files"""
        try:
            cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
            deleted_count = 0
            
            # Clean upload folder
            for file_path in self.upload_folder.rglob('*'):
                if file_path.is_file():
                    file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    if file_mtime < cutoff_time:
                        try:
                            file_path.unlink()
                            deleted_count += 1
                        except Exception as e:
                            logger.warning(f"Failed to delete old file {file_path}: {e}")
            
            # Clean audio output folder
            for file_path in self.audio_output_folder.rglob('*'):
                if file_path.is_file():
                    file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                    if file_mtime < cutoff_time:
                        try:
                            file_path.unlink()
                            deleted_count += 1
                        except Exception as e:
                            logger.warning(f"Failed to delete old file {file_path}: {e}")
            
            logger.info(f"Cleaned up {deleted_count} old files")
            return deleted_count
            
        except Exception as e:
            logger.error(f"File cleanup failed: {e}")
            return 0
    
    def get_file_info(self, filename: str, subfolder: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get information about a file"""
        try:
            file_path = self.get_file_path(filename, subfolder)
            
            # Check for encrypted version
            encrypted_path = Path(str(file_path) + '.encrypted')
            actual_path = encrypted_path if encrypted_path.exists() else file_path
            
            if not actual_path.exists():
                return None
            
            stat = actual_path.stat()
            
            return {
                "filename": filename,
                "file_path": str(actual_path),
                "file_size": stat.st_size,
                "encrypted": actual_path.name.endswith('.encrypted'),
                "created_time": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_time": datetime.fromtimestamp(stat.st_mtime).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get file info for {filename}: {e}")
            return None
    
    def list_files(self, subfolder: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all files in directory"""
        try:
            base_dir = self.upload_folder
            if subfolder:
                base_dir = base_dir / subfolder
            
            if not base_dir.exists():
                return []
            
            files = []
            for file_path in base_dir.iterdir():
                if file_path.is_file():
                    try:
                        stat = file_path.stat()
                        files.append({
                            "filename": file_path.name,
                            "file_size": stat.st_size,
                            "encrypted": file_path.name.endswith('.encrypted'),
                            "modified_time": datetime.fromtimestamp(stat.st_mtime).isoformat()
                        })
                    except Exception as e:
                        logger.warning(f"Failed to get info for {file_path}: {e}")
            
            return sorted(files, key=lambda x: x['modified_time'], reverse=True)
            
        except Exception as e:
            logger.error(f"Failed to list files: {e}")
            return []
    
    def get_file_content(self, filename: str, subfolder: Optional[str] = None) -> Optional[bytes]:
        """Get file content (decrypted if necessary)"""
        try:
            file_path = self.get_file_path(filename, subfolder)
            
            # Check for encrypted version
            encrypted_path = Path(str(file_path) + '.encrypted')
            
            if encrypted_path.exists() and self.encryption:
                # Decrypt and return content
                temp_path = str(file_path) + '_temp'
                self.encryption.decrypt_file(str(encrypted_path), temp_path)
                
                with open(temp_path, 'rb') as f:
                    content = f.read()
                
                Path(temp_path).unlink()  # Clean up temp file
                return content
                
            elif file_path.exists():
                # Return unencrypted content
                with open(file_path, 'rb') as f:
                    return f.read()
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get file content for {filename}: {e}")
            return None


# Global file handler service instance
_file_handler_service: Optional[FileHandlerService] = None

def get_file_handler() -> FileHandlerService:
    """Get or create global file handler service instance"""
    global _file_handler_service
    if _file_handler_service is None:
        _file_handler_service = FileHandlerService()
    return _file_handler_service