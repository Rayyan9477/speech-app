import os
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
from typing import Optional
from loguru import logger


class FileEncryption:
    def __init__(self, key: Optional[str] = None):
        if key:
            self.key = key.encode()
        else:
            self.key = self._generate_key()
        
        self.cipher = Fernet(self._derive_key(self.key))
    
    def _generate_key(self) -> bytes:
        """Generate a new encryption key"""
        return Fernet.generate_key()
    
    def _derive_key(self, password: bytes, salt: Optional[bytes] = None) -> bytes:
        """Derive encryption key from password"""
        if salt is None:
            salt = b"stable_salt_for_audio_files"  # Use consistent salt for audio files
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
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
        _encryption_instance = FileEncryption()
    return _encryption_instance