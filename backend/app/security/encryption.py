import os
import secrets
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
from typing import Optional
from loguru import logger
from ..core.config import settings


class FileEncryption:
    def __init__(self, key: Optional[str] = None):
        """Initialize encryption with secure key management."""
        if key:
            # Use provided key for encryption
            if isinstance(key, str):
                key = key.encode()
            self.master_key = key
        else:
            # Use key from settings or generate a secure one
            if settings.ENCRYPTION_KEY:
                self.master_key = settings.ENCRYPTION_KEY.encode()
            else:
                raise ValueError("ENCRYPTION_KEY not configured. Set ENCRYPTION_KEY environment variable.")
        
        # Generate a random salt for each encryption instance
        self.salt = self._get_or_generate_salt()
        self.cipher = Fernet(self._derive_key(self.master_key, self.salt))
    
    def _get_or_generate_salt(self) -> bytes:
        """Get existing salt or generate a new secure salt."""
        salt_file = Path("encryption_salt.key")
        
        if salt_file.exists():
            try:
                with open(salt_file, 'rb') as f:
                    return f.read()
            except Exception as e:
                logger.warning(f"Could not read existing salt: {e}")
        
        # Generate new secure salt
        salt = secrets.token_bytes(32)
        
        try:
            with open(salt_file, 'wb') as f:
                f.write(salt)
            # Set restrictive permissions
            salt_file.chmod(0o600)
            logger.info("Generated new encryption salt")
        except Exception as e:
            logger.warning(f"Could not save salt to file: {e}")
        
        return salt
    
    def _derive_key(self, password: bytes, salt: bytes) -> bytes:
        """Derive encryption key from password with secure parameters."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=400000,  # Increased iterations for better security
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        return key
    
    def encrypt_file(self, file_path: str, encrypted_path: Optional[str] = None) -> str:
        """Encrypt a file and save it to encrypted_path"""
        try:
            file_path = Path(file_path)
            if encrypted_path is None:
                encrypted_path = file_path.with_suffix(file_path.suffix + '.encrypted')
            else:
                encrypted_path = Path(encrypted_path)
            
            with open(file_path, 'rb') as file:
                file_data = file.read()
            
            encrypted_data = self.cipher.encrypt(file_data)
            
            with open(encrypted_path, 'wb') as encrypted_file:
                encrypted_file.write(encrypted_data)
            
            logger.info(f"File encrypted: {file_path} -> {encrypted_path}")
            return str(encrypted_path)
            
        except Exception as e:
            logger.error(f"Encryption failed for {file_path}: {e}")
            raise
    
    def decrypt_file(self, encrypted_path: str, decrypted_path: Optional[str] = None) -> str:
        """Decrypt a file and save it to decrypted_path"""
        try:
            encrypted_path = Path(encrypted_path)
            if decrypted_path is None:
                decrypted_path = encrypted_path.with_suffix('').with_suffix('')
            else:
                decrypted_path = Path(decrypted_path)
            
            with open(encrypted_path, 'rb') as encrypted_file:
                encrypted_data = encrypted_file.read()
            
            decrypted_data = self.cipher.decrypt(encrypted_data)
            
            with open(decrypted_path, 'wb') as file:
                file.write(decrypted_data)
            
            logger.info(f"File decrypted: {encrypted_path} -> {decrypted_path}")
            return str(decrypted_path)
            
        except Exception as e:
            logger.error(f"Decryption failed for {encrypted_path}: {e}")
            raise
    
    def encrypt_data(self, data: bytes) -> bytes:
        """Encrypt raw bytes data"""
        return self.cipher.encrypt(data)
    
    def decrypt_data(self, encrypted_data: bytes) -> bytes:
        """Decrypt raw bytes data"""
        return self.cipher.decrypt(encrypted_data)


# Initialize global encryption instance
_encryption_instance: Optional[FileEncryption] = None

def get_encryption() -> FileEncryption:
    """Get or create global encryption instance"""
    global _encryption_instance
    if _encryption_instance is None:
        try:
            _encryption_instance = FileEncryption()
        except ValueError as e:
            logger.error(f"Encryption initialization failed: {e}")
            raise
    return _encryption_instance