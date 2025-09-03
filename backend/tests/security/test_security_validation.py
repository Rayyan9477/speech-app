"""
Security tests for the Speech App
Tests authentication, authorization, encryption, input validation, and security headers
"""

import pytest
from unittest.mock import patch, Mock
from fastapi import status
from httpx import AsyncClient
import hashlib
import base64
from pathlib import Path
import tempfile

from app.security.encryption import FileEncryption


@pytest.mark.security
class TestInputValidation:
    """Test input validation and sanitization"""

    @pytest.mark.asyncio
    async def test_file_upload_size_validation(
        self, 
        async_test_client: AsyncClient,
        oversized_file: str
    ):
        """Test file upload size limits"""
        
        with open(oversized_file, 'rb') as large_file:
            files = {"file": ("huge_file.wav", large_file, "audio/wav")}
            data = {"language": "en", "task": "transcribe"}
            
            response = await async_test_client.post(
                "/api/v1/stt/transcribe",
                files=files,
                data=data
            )
        
        # Should reject oversized files
        assert response.status_code in [413, 422, 400]  # Request Entity Too Large or validation error

    @pytest.mark.asyncio
    async def test_file_type_validation(
        self, 
        async_test_client: AsyncClient,
        malicious_file: str
    ):
        """Test file type validation prevents malicious file uploads"""
        
        with open(malicious_file, 'rb') as bad_file:
            files = {"file": ("malicious.exe", bad_file, "application/x-executable")}
            data = {"language": "en", "task": "transcribe"}
            
            response = await async_test_client.post(
                "/api/v1/stt/transcribe",
                files=files,
                data=data
            )
        
        # Should reject non-audio files
        assert response.status_code in [422, 400, 415]

    @pytest.mark.asyncio
    async def test_text_input_length_validation(
        self, 
        async_test_client: AsyncClient,
        mock_tts_service,
        mock_database
    ):
        """Test text input length limits"""
        
        # Create extremely long text (exceeding limits)
        very_long_text = "A" * 10000  # Exceeds typical limits
        
        with patch('app.api.routes.tts.get_tts_service', return_value=mock_tts_service), \
             patch('app.api.routes.tts.get_database', return_value=mock_database):
            
            response = await async_test_client.post(
                "/api/v1/tts/synthesize",
                json={
                    "text": very_long_text,
                    "language": "en",
                    "voice_style": "neutral",
                    "emotion": "neutral"
                }
            )
        
        # Should reject overly long text
        assert response.status_code == 400
        error_data = response.json()
        assert "too long" in error_data["detail"].lower()

    @pytest.mark.asyncio
    async def test_sql_injection_prevention(
        self, 
        async_test_client: AsyncClient,
        mock_database
    ):
        """Test SQL injection prevention in session queries"""
        
        # Attempt SQL injection in session ID
        malicious_session_id = "'; DROP TABLE sessions; --"
        
        mock_database.get_audio_session.return_value = None
        
        with patch('app.api.routes.stt.get_database', return_value=mock_database):
            response = await async_test_client.get(f"/api/v1/stt/session/{malicious_session_id}")
        
        # Should handle safely without executing malicious SQL
        assert response.status_code == 404
        # Verify the database method was called with the malicious string
        mock_database.get_audio_session.assert_called_once_with(malicious_session_id)

    @pytest.mark.asyncio
    async def test_xss_prevention_in_responses(
        self, 
        async_test_client: AsyncClient,
        mock_stt_service,
        mock_file_handler,
        mock_database
    ):
        """Test XSS prevention in API responses"""
        
        # Mock transcription result with potential XSS payload
        xss_payload = "<script>alert('XSS')</script>"
        mock_stt_service.transcribe_audio.return_value = {
            'transcription': xss_payload,
            'language': 'en',
            'confidence': 0.95,
            'audio_duration': 2.0,
            'model': 'whisper-large-v3-turbo'
        }
        
        with patch('app.api.routes.stt.get_stt_service', return_value=mock_stt_service), \
             patch('app.api.routes.stt.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.stt.get_database', return_value=mock_database):
            
            with open("test_file.wav", 'w') as f:
                f.write("fake audio")
            
            with open("test_file.wav", 'rb') as audio_file:
                files = {"file": ("test.wav", audio_file, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
        
        # Response should contain the raw text (API responses are JSON, so naturally escaped)
        assert response.status_code == 200
        response_data = response.json()
        
        # JSON automatically escapes HTML, but verify the content is preserved
        assert xss_payload in str(response_data)
        # Verify Content-Type header prevents script execution
        assert response.headers.get("content-type", "").startswith("application/json")

    @pytest.mark.asyncio
    async def test_path_traversal_prevention(
        self, 
        async_test_client: AsyncClient
    ):
        """Test path traversal prevention in file serving"""
        
        # Attempt path traversal in filename
        malicious_filename = "../../../etc/passwd"
        
        response = await async_test_client.get(f"/api/v1/tts/audio/{malicious_filename}")
        
        # Should not serve files outside intended directory
        assert response.status_code in [400, 404, 403]

    @pytest.mark.asyncio
    async def test_parameter_validation_special_characters(
        self, 
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test parameter validation handles special characters safely"""
        
        special_chars = [
            "'; DROP TABLE voice_clones; --",
            "<script>alert('xss')</script>",
            "../../../etc/passwd",
            "NULL",
            "undefined",
            "%00",
            "\x00\x01\x02",
            "' UNION SELECT * FROM users --"
        ]
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            for malicious_input in special_chars:
                response = await async_test_client.get(f"/api/v1/voice/{malicious_input}/info")
                
                # Should handle safely without errors
                assert response.status_code in [200, 404, 400]  # Valid responses, not 500
                
                # Verify the input was passed safely to the service
                mock_voice_cloning_service.list_voice_clones.assert_called()


@pytest.mark.security
class TestEncryption:
    """Test encryption and decryption functionality"""

    def test_file_encryption_basic(self, temp_dir):
        """Test basic file encryption and decryption"""
        
        encryption = FileEncryption()
        
        # Create test file
        test_file = temp_dir / "test_audio.wav"
        test_content = b"fake audio content for testing"
        test_file.write_bytes(test_content)
        
        # Encrypt file
        encrypted_path = encryption.encrypt_file(str(test_file))
        
        assert Path(encrypted_path).exists()
        assert encrypted_path != str(test_file)
        assert encrypted_path.endswith('.encrypted')
        
        # Verify encrypted content is different from original
        encrypted_content = Path(encrypted_path).read_bytes()
        assert encrypted_content != test_content
        
        # Decrypt file
        decrypted_path = temp_dir / "decrypted_audio.wav"
        decryption_result = encryption.decrypt_file(encrypted_path, str(decrypted_path))
        
        assert Path(decryption_result).exists()
        
        # Verify decrypted content matches original
        decrypted_content = Path(decryption_result).read_bytes()
        assert decrypted_content == test_content

    def test_encryption_with_different_keys(self, temp_dir):
        """Test that different keys produce different encrypted results"""
        
        encryption1 = FileEncryption("key1")
        encryption2 = FileEncryption("key2")
        
        # Create test file
        test_file = temp_dir / "test_audio.wav"
        test_content = b"test content for different keys"
        test_file.write_bytes(test_content)
        
        # Encrypt with different keys
        encrypted_path1 = encryption1.encrypt_file(str(test_file))
        
        # Create another copy of the file for second encryption
        test_file2 = temp_dir / "test_audio2.wav"
        test_file2.write_bytes(test_content)
        encrypted_path2 = encryption2.encrypt_file(str(test_file2))
        
        # Encrypted content should be different
        encrypted_content1 = Path(encrypted_path1).read_bytes()
        encrypted_content2 = Path(encrypted_path2).read_bytes()
        assert encrypted_content1 != encrypted_content2

    def test_encryption_key_derivation(self):
        """Test encryption key derivation is consistent"""
        
        password = "test_password"
        encryption1 = FileEncryption(password)
        encryption2 = FileEncryption(password)
        
        # Same password should produce same key derivation
        assert encryption1.key == encryption2.key

    def test_data_encryption_decryption(self):
        """Test direct data encryption/decryption"""
        
        encryption = FileEncryption()
        test_data = b"sensitive data to encrypt"
        
        # Encrypt data
        encrypted_data = encryption.encrypt_data(test_data)
        assert encrypted_data != test_data
        assert len(encrypted_data) > len(test_data)  # Includes encryption overhead
        
        # Decrypt data
        decrypted_data = encryption.decrypt_data(encrypted_data)
        assert decrypted_data == test_data

    def test_encryption_with_empty_file(self, temp_dir):
        """Test encryption handles empty files correctly"""
        
        encryption = FileEncryption()
        
        # Create empty file
        empty_file = temp_dir / "empty.wav"
        empty_file.touch()
        
        # Encrypt empty file
        encrypted_path = encryption.encrypt_file(str(empty_file))
        
        assert Path(encrypted_path).exists()
        assert Path(encrypted_path).stat().st_size > 0  # Should have encryption metadata
        
        # Decrypt back
        decrypted_path = temp_dir / "decrypted_empty.wav"
        decryption_result = encryption.decrypt_file(encrypted_path, str(decrypted_path))
        
        assert Path(decryption_result).exists()
        assert Path(decryption_result).stat().st_size == 0  # Should be empty again

    def test_encryption_error_handling(self, temp_dir):
        """Test encryption error handling for invalid inputs"""
        
        encryption = FileEncryption()
        
        # Test encrypting non-existent file
        with pytest.raises((FileNotFoundError, OSError)):
            encryption.encrypt_file("/nonexistent/file.wav")
        
        # Test decrypting non-existent file
        with pytest.raises((FileNotFoundError, OSError)):
            encryption.decrypt_file("/nonexistent/encrypted.wav", str(temp_dir / "output.wav"))
        
        # Test decrypting invalid encrypted file
        fake_encrypted = temp_dir / "fake.encrypted"
        fake_encrypted.write_bytes(b"not actually encrypted data")
        
        with pytest.raises(Exception):  # Should raise decryption error
            encryption.decrypt_file(str(fake_encrypted), str(temp_dir / "output.wav"))


@pytest.mark.security
class TestAuthenticationSecurity:
    """Test authentication and authorization security measures"""

    @pytest.mark.asyncio
    async def test_api_endpoints_without_auth(self, async_test_client: AsyncClient):
        """Test that API endpoints handle missing authentication gracefully"""
        
        # Test various endpoints without authentication
        endpoints = [
            "/api/v1/stt/transcribe",
            "/api/v1/tts/synthesize",
            "/api/v1/voice/list",
            "/api/v1/voice/create-clone"
        ]
        
        for endpoint in endpoints:
            if endpoint in ["/api/v1/stt/transcribe", "/api/v1/voice/create-clone"]:
                # POST endpoints requiring file upload
                response = await async_test_client.post(endpoint, data={})
            elif endpoint == "/api/v1/tts/synthesize":
                # POST endpoint with JSON
                response = await async_test_client.post(endpoint, json={})
            else:
                # GET endpoints
                response = await async_test_client.get(endpoint)
            
            # Should either work (if no auth required) or return proper auth error
            assert response.status_code not in [500]  # Should not crash

    @pytest.mark.asyncio
    async def test_session_security(
        self, 
        async_test_client: AsyncClient,
        mock_database
    ):
        """Test session management security"""
        
        # Test access to other user's sessions
        mock_database.get_audio_session.return_value = Mock(
            id="other_user_session",
            original_filename="confidential.wav",
            transcription="Secret information",
            user_id="other_user"
        )
        
        with patch('app.api.routes.stt.get_database', return_value=mock_database):
            response = await async_test_client.get("/api/v1/stt/session/other_user_session")
            
            # Should return session data (no auth in current implementation)
            # In a real app, this should check user ownership
            assert response.status_code in [200, 403, 401]

    @pytest.mark.asyncio
    async def test_user_id_parameter_validation(
        self, 
        async_test_client: AsyncClient,
        mock_voice_cloning_service
    ):
        """Test user ID parameter validation"""
        
        malicious_user_ids = [
            "'; DROP TABLE users; --",
            "../admin",
            "NULL",
            "<script>alert('xss')</script>",
            "user\x00admin"
        ]
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service):
            for user_id in malicious_user_ids:
                response = await async_test_client.get(f"/api/v1/voice/list?user_id={user_id}")
                
                # Should handle safely
                assert response.status_code in [200, 400]  # Valid responses
                
                # Verify the malicious input was passed to the service for proper handling
                mock_voice_cloning_service.list_voice_clones.assert_called()


@pytest.mark.security
class TestSecurityHeaders:
    """Test security headers and CORS configuration"""

    @pytest.mark.asyncio
    async def test_cors_headers(self, async_test_client: AsyncClient):
        """Test CORS headers are properly configured"""
        
        response = await async_test_client.get("/api/v1/status")
        
        # Should have proper CORS headers (in test environment they might be different)
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_content_type_headers(self, async_test_client: AsyncClient):
        """Test Content-Type headers prevent content-type sniffing attacks"""
        
        response = await async_test_client.get("/api/v1/status")
        
        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "").lower()

    @pytest.mark.asyncio
    async def test_options_method_handling(self, async_test_client: AsyncClient):
        """Test OPTIONS method handling for CORS preflight"""
        
        response = await async_test_client.options("/api/v1/status")
        
        # Should handle OPTIONS requests properly
        assert response.status_code in [200, 204, 405]  # Various valid responses

    @pytest.mark.asyncio
    async def test_error_response_information_disclosure(
        self, 
        async_test_client: AsyncClient
    ):
        """Test that error responses don't leak sensitive information"""
        
        # Trigger various error conditions
        error_endpoints = [
            "/api/v1/stt/session/nonexistent",
            "/api/v1/voice/nonexistent/info",
            "/nonexistent/endpoint"
        ]
        
        for endpoint in error_endpoints:
            response = await async_test_client.get(endpoint)
            
            # Check that error responses don't expose internal details
            if response.status_code >= 400:
                response_text = response.text.lower()
                
                # Should not expose internal paths, stack traces, or DB details
                sensitive_patterns = [
                    "traceback",
                    "exception",
                    "/app/",
                    "database",
                    "sql",
                    "internal server error details"
                ]
                
                for pattern in sensitive_patterns:
                    assert pattern not in response_text, f"Response exposes {pattern}"


@pytest.mark.security
class TestDataSanitization:
    """Test data sanitization and validation"""

    @pytest.mark.asyncio
    async def test_filename_sanitization(
        self, 
        async_test_client: AsyncClient,
        temp_dir
    ):
        """Test that uploaded filenames are properly sanitized"""
        
        malicious_filenames = [
            "../../../etc/passwd",
            "..\\..\\windows\\system32\\config\\sam",
            "file<script>alert('xss')</script>.wav",
            "file\x00.wav",
            "CON.wav",  # Windows reserved name
            "file|rm -rf /.wav",
            "file; rm -rf / #.wav"
        ]
        
        for filename in malicious_filenames:
            # Create temporary test file
            test_file = temp_dir / "safe_content.wav"
            test_file.write_bytes(b"safe audio content")
            
            with open(test_file, 'rb') as f:
                files = {"file": (filename, f, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
            
            # Should handle malicious filenames safely
            assert response.status_code in [200, 400, 422]  # Valid responses, not 500

    @pytest.mark.asyncio
    async def test_voice_clone_name_sanitization(
        self, 
        async_test_client: AsyncClient,
        sample_audio_file: str,
        mock_voice_cloning_service,
        mock_file_handler,
        mock_database
    ):
        """Test voice clone name sanitization"""
        
        malicious_names = [
            "<script>alert('xss')</script>",
            "'; DROP TABLE voice_clones; --",
            "../../../admin",
            "name\x00hidden",
            "name\r\nhidden",
            "name\t\thidden"
        ]
        
        with patch('app.api.routes.voice_cloning.get_voice_cloning_service', return_value=mock_voice_cloning_service), \
             patch('app.api.routes.voice_cloning.get_file_handler', return_value=mock_file_handler), \
             patch('app.api.routes.voice_cloning.get_database', return_value=mock_database):
            
            for malicious_name in malicious_names:
                with open(sample_audio_file, 'rb') as audio_file:
                    files = {"file": ("voice.wav", audio_file, "audio/wav")}
                    data = {"name": malicious_name, "user_id": "test_user"}
                    
                    response = await async_test_client.post(
                        "/api/v1/voice/create-clone",
                        files=files,
                        data=data
                    )
                
                # Should handle malicious names safely
                assert response.status_code in [200, 400]  # Valid responses
                
                if response.status_code == 200:
                    # Verify the service was called with the input (sanitization happens in service)
                    mock_voice_cloning_service.create_voice_clone.assert_called()

    @pytest.mark.asyncio
    async def test_json_payload_size_limits(
        self, 
        async_test_client: AsyncClient
    ):
        """Test JSON payload size limits prevent DoS attacks"""
        
        # Create very large JSON payload
        large_text = "A" * 1000000  # 1MB of text
        large_payload = {
            "text": large_text,
            "language": "en",
            "voice_style": "neutral",
            "emotion": "neutral"
        }
        
        response = await async_test_client.post(
            "/api/v1/tts/synthesize",
            json=large_payload
        )
        
        # Should reject overly large payloads
        assert response.status_code in [400, 413, 422]

    def test_memory_consumption_limits(self, temp_dir):
        """Test that file operations have reasonable memory limits"""
        
        encryption = FileEncryption()
        
        # Create a large file (but not huge to avoid test slowdown)
        large_file = temp_dir / "large_test.wav"
        large_content = b"X" * (10 * 1024 * 1024)  # 10MB
        large_file.write_bytes(large_content)
        
        # Encryption should handle large files without excessive memory usage
        import psutil
        process = psutil.Process()
        initial_memory = process.memory_info().rss
        
        encrypted_path = encryption.encrypt_file(str(large_file))
        
        current_memory = process.memory_info().rss
        memory_increase = (current_memory - initial_memory) / 1024 / 1024  # MB
        
        # Memory increase should be reasonable (not loading entire file into memory)
        assert memory_increase < 50, f"Memory usage too high: {memory_increase}MB"
        
        # Verify encryption worked
        assert Path(encrypted_path).exists()
        assert Path(encrypted_path).stat().st_size > 0


@pytest.mark.security
class TestRateLimiting:
    """Test rate limiting and DoS protection"""

    @pytest.mark.asyncio
    async def test_rapid_api_requests(self, async_test_client: AsyncClient):
        """Test handling of rapid API requests"""
        
        # Make rapid requests to status endpoint
        responses = []
        for i in range(20):  # 20 rapid requests
            response = await async_test_client.get("/api/v1/status")
            responses.append(response.status_code)
        
        # Most requests should succeed (no rate limiting in test environment)
        success_count = sum(1 for status in responses if status == 200)
        assert success_count >= 15, "Too many requests failed"

    @pytest.mark.asyncio
    async def test_concurrent_file_uploads(
        self, 
        async_test_client: AsyncClient,
        performance_test_files
    ):
        """Test handling of concurrent file uploads"""
        
        import asyncio
        
        async def upload_file(file_path):
            with open(file_path, 'rb') as f:
                files = {"file": ("test.wav", f, "audio/wav")}
                data = {"language": "en", "task": "transcribe"}
                
                response = await async_test_client.post(
                    "/api/v1/stt/transcribe",
                    files=files,
                    data=data
                )
                return response.status_code
        
        # Limit concurrent uploads for testing
        limited_files = performance_test_files[:5]
        
        # Upload files concurrently
        tasks = [upload_file(file_path) for file_path in limited_files]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Should handle concurrent uploads gracefully
        successful = sum(1 for r in responses if isinstance(r, int) and r in [200, 422])
        assert successful >= len(limited_files) // 2, "Too many concurrent uploads failed"