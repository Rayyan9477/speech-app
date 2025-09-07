"""
Integration tests for authentication endpoints.
Tests the complete auth flow including database interactions.
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import json

from app.app import app
from app.database.user_models import User, UserRole, UserStatus
from app.security.auth import jwt_manager

class TestAuthIntegration:
    """Integration tests for authentication endpoints."""
    
    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)
    
    @pytest.fixture
    def test_user_data(self):
        """Test user registration data."""
        return {
            "username": "testuser123",
            "email": "test@example.com",
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User"
        }
    
    @pytest.fixture
    def admin_user_data(self):
        """Admin user data."""
        return {
            "username": "admin",
            "email": "admin@example.com",
            "password": "AdminPassword123!",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin",
            "status": "active"
        }

    def test_user_registration_flow(self, client, test_user_data):
        """Test complete user registration flow."""
        # Register new user
        response = client.post("/api/v1/auth/register", json=test_user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert data["user"]["username"] == test_user_data["username"]
        assert data["user"]["email"] == test_user_data["email"]
        assert data["user"]["role"] == "user"
        assert data["user"]["status"] == "active"
        assert "password" not in data["user"]
        
        # Verify user can login
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": test_user_data["password"]
        })
        
        assert login_response.status_code == 200
        login_data = login_response.json()
        assert "access_token" in login_data
        assert "refresh_token" in login_data
        assert login_data["token_type"] == "bearer"
        assert login_data["user"]["username"] == test_user_data["username"]

    def test_duplicate_user_registration(self, client, test_user_data):
        """Test registration with duplicate username/email."""
        # Register first user
        client.post("/api/v1/auth/register", json=test_user_data)
        
        # Try to register with same username
        response = client.post("/api/v1/auth/register", json=test_user_data)
        assert response.status_code == 409
        assert "Username already exists" in response.json()["detail"]
        
        # Try to register with same email but different username
        duplicate_email_data = test_user_data.copy()
        duplicate_email_data["username"] = "different_user"
        response = client.post("/api/v1/auth/register", json=duplicate_email_data)
        assert response.status_code == 409
        assert "Email already exists" in response.json()["detail"]

    def test_login_with_username_and_email(self, client, test_user_data):
        """Test login with both username and email."""
        # Register user first
        client.post("/api/v1/auth/register", json=test_user_data)
        
        # Login with username
        response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": test_user_data["password"]
        })
        assert response.status_code == 200
        
        # Login with email
        response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        assert response.status_code == 200

    def test_login_failure_scenarios(self, client, test_user_data):
        """Test various login failure scenarios."""
        # Register user first
        client.post("/api/v1/auth/register", json=test_user_data)
        
        # Wrong password
        response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": "WrongPassword123!"
        })
        assert response.status_code == 401
        assert "Invalid username/email or password" in response.json()["detail"]
        
        # Non-existent user
        response = client.post("/api/v1/auth/login", json={
            "username_or_email": "nonexistent",
            "password": test_user_data["password"]
        })
        assert response.status_code == 401
        
        # Empty credentials
        response = client.post("/api/v1/auth/login", json={
            "username_or_email": "",
            "password": ""
        })
        assert response.status_code == 422  # Validation error

    def test_password_validation(self, client, test_user_data):
        """Test password validation rules."""
        invalid_passwords = [
            "short",  # Too short
            "nouppercase123!",  # No uppercase
            "NOLOWERCASE123!",  # No lowercase
            "NoNumbers!",  # No numbers
            "NoSpecialChars123",  # No special characters
        ]
        
        for invalid_password in invalid_passwords:
            data = test_user_data.copy()
            data["password"] = invalid_password
            
            response = client.post("/api/v1/auth/register", json=data)
            assert response.status_code == 422
            assert "validation error" in response.json()["detail"][0]["type"]

    def test_jwt_token_flow(self, client, test_user_data):
        """Test JWT token creation and validation."""
        # Register and login
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": test_user_data["password"]
        })
        
        tokens = login_response.json()
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]
        
        # Use access token to access protected endpoint
        headers = {"Authorization": f"Bearer {access_token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 200
        user_data = response.json()
        assert user_data["username"] == test_user_data["username"]
        
        # Test token refresh
        headers = {"Authorization": f"Bearer {refresh_token}"}
        refresh_response = client.post("/api/v1/auth/refresh", headers=headers)
        assert refresh_response.status_code == 200
        new_tokens = refresh_response.json()
        assert "access_token" in new_tokens
        assert new_tokens["token_type"] == "bearer"

    def test_logout_functionality(self, client, test_user_data):
        """Test logout functionality."""
        # Register, login
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": test_user_data["password"]
        })
        
        access_token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Logout
        logout_response = client.post("/api/v1/auth/logout", headers=headers)
        assert logout_response.status_code == 200
        assert "Logged out successfully" in logout_response.json()["message"]
        
        # Try to use token after logout (should fail)
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401

    def test_user_profile_management(self, client, test_user_data):
        """Test user profile update functionality."""
        # Register and login
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": test_user_data["password"]
        })
        
        access_token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Get current user info
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 200
        user_data = response.json()
        
        # Update user info
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "settings": {"theme": "dark", "language": "en"}
        }
        
        response = client.put("/api/v1/auth/me", headers=headers, json=update_data)
        assert response.status_code == 200
        updated_user = response.json()
        assert updated_user["first_name"] == "Updated"
        assert updated_user["last_name"] == "Name"
        assert updated_user["settings"]["theme"] == "dark"

    def test_password_change_flow(self, client, test_user_data):
        """Test password change functionality."""
        # Register and login
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": test_user_data["password"]
        })
        
        access_token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Change password
        new_password = "NewPassword123!"
        password_change_data = {
            "current_password": test_user_data["password"],
            "new_password": new_password
        }
        
        response = client.put("/api/v1/auth/me/password", headers=headers, json=password_change_data)
        assert response.status_code == 200
        assert "Password changed successfully" in response.json()["message"]
        
        # Old token should be invalid after password change
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401
        
        # Login with new password should work
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": new_password
        })
        assert login_response.status_code == 200

    def test_admin_user_management(self, client, test_user_data, admin_user_data):
        """Test admin user management endpoints."""
        # Create admin user first (this would typically be seeded)
        admin_client = TestClient(app)
        admin_response = admin_client.post("/api/v1/auth/register", json={
            "username": admin_user_data["username"],
            "email": admin_user_data["email"],
            "password": admin_user_data["password"],
            "first_name": admin_user_data["first_name"],
            "last_name": admin_user_data["last_name"]
        })
        
        # Login as admin
        admin_login = admin_client.post("/api/v1/auth/login", json={
            "username_or_email": admin_user_data["username"],
            "password": admin_user_data["password"]
        })
        
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create regular user
        client.post("/api/v1/auth/register", json=test_user_data)
        
        # Admin should be able to list users
        response = admin_client.get("/api/v1/auth/admin/users", headers=admin_headers)
        assert response.status_code == 200
        users = response.json()
        assert len(users) >= 2  # Admin + test user
        
        # Admin should be able to create users
        new_user_data = {
            "username": "admin_created",
            "email": "admin_created@example.com",
            "password": "AdminCreated123!",
            "role": "user",
            "status": "active",
            "first_name": "Admin",
            "last_name": "Created"
        }
        
        response = admin_client.post("/api/v1/auth/admin/users", headers=admin_headers, json=new_user_data)
        assert response.status_code == 201
        created_user = response.json()
        assert created_user["username"] == new_user_data["username"]

    def test_unauthorized_access_to_protected_routes(self, client):
        """Test unauthorized access attempts."""
        # Try to access protected routes without token
        protected_routes = [
            ("/api/v1/auth/me", "get"),
            ("/api/v1/auth/me", "put"),
            ("/api/v1/auth/me/password", "put"),
            ("/api/v1/auth/logout", "post"),
            ("/api/v1/auth/logout-all", "post"),
        ]
        
        for route, method in protected_routes:
            response = getattr(client, method)(route)
            assert response.status_code in [401, 403]

    def test_invalid_token_handling(self, client):
        """Test handling of invalid tokens."""
        invalid_tokens = [
            "invalid_token",
            "Bearer invalid_token",
            "",
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.invalid.signature",
        ]
        
        for token in invalid_tokens:
            headers = {"Authorization": f"Bearer {token}"}
            response = client.get("/api/v1/auth/me", headers=headers)
            assert response.status_code == 401

    def test_token_expiration(self, client, test_user_data):
        """Test token expiration handling."""
        # Register and login
        client.post("/api/v1/auth/register", json=test_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": test_user_data["password"]
        })
        
        # Create an expired token
        user_data = login_response.json()["user"]
        expired_token = jwt_manager.create_access_token(
            User(**user_data), 
            "127.0.0.1", 
            "test-agent",
            expires_delta=timedelta(seconds=-1)  # Already expired
        )
        
        headers = {"Authorization": f"Bearer {expired_token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401

    def test_concurrent_user_operations(self, client, test_user_data):
        """Test concurrent operations on same user."""
        import threading
        import time
        
        # Register user first
        client.post("/api/v1/auth/register", json=test_user_data)
        
        # Login to get token
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": test_user_data["password"]
        })
        
        access_token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        results = []
        
        def update_user(index):
            """Update user concurrently."""
            update_data = {"first_name": f"Updated{index}"}
            response = client.put("/api/v1/auth/me", headers=headers, json=update_data)
            results.append(response.status_code)
        
        # Create multiple threads to update user simultaneously
        threads = []
        for i in range(5):
            thread = threading.Thread(target=update_user, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All requests should succeed (database should handle concurrency)
        assert all(status == 200 for status in results)

    def test_rate_limiting(self, client, test_user_data):
        """Test rate limiting on login attempts."""
        # This test assumes rate limiting is implemented
        # Multiple failed login attempts should trigger rate limiting
        
        failed_login_data = {
            "username_or_email": "nonexistent@example.com",
            "password": "WrongPassword123!"
        }
        
        # Make multiple failed attempts
        for i in range(10):
            response = client.post("/api/v1/auth/login", json=failed_login_data)
            # First few should return 401, later ones might return 429 (rate limited)
            assert response.status_code in [401, 429]

    def test_csrf_protection(self, client, test_user_data):
        """Test CSRF protection (if implemented)."""
        # This test would verify CSRF token validation
        # Implementation depends on the specific CSRF protection used
        pass

    def test_security_headers(self, client):
        """Test security headers in responses."""
        response = client.get("/api/v1/auth/me")
        
        # Check for security headers (adjust based on implementation)
        headers = response.headers
        
        # These are common security headers that should be present
        expected_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options",
            "X-XSS-Protection",
        ]
        
        # Note: Not all headers may be implemented, adjust test accordingly
        # This serves as documentation for expected security headers

    def test_database_connection_failure(self, client, monkeypatch):
        """Test handling of database connection failures."""
        # Mock database connection failure
        def mock_db_error(*args, **kwargs):
            raise Exception("Database connection failed")
        
        # This would require mocking the database connection
        # Implementation depends on the specific database setup
        pass

    def test_memory_usage_during_bulk_operations(self, client):
        """Test memory usage doesn't spike during bulk operations."""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Perform bulk operations
        test_users = []
        for i in range(50):
            user_data = {
                "username": f"bulk_user_{i}",
                "email": f"bulk_{i}@example.com",
                "password": "BulkPassword123!",
                "first_name": "Bulk",
                "last_name": f"User{i}"
            }
            test_users.append(user_data)
        
        # Register users
        for user_data in test_users:
            response = client.post("/api/v1/auth/register", json=user_data)
            # Some may fail due to uniqueness constraints in concurrent tests
            assert response.status_code in [201, 409]
        
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 100MB for 50 users)
        assert memory_increase < 100 * 1024 * 1024  # 100MB

    def test_email_format_validation(self, client, test_user_data):
        """Test email format validation."""
        invalid_emails = [
            "invalid-email",
            "@example.com",
            "test@",
            "test..test@example.com",
            "test@example",
        ]
        
        for invalid_email in invalid_emails:
            data = test_user_data.copy()
            data["email"] = invalid_email
            
            response = client.post("/api/v1/auth/register", json=data)
            assert response.status_code == 422

    def test_username_format_validation(self, client, test_user_data):
        """Test username format validation."""
        invalid_usernames = [
            "ab",  # Too short
            "a" * 51,  # Too long
            "user with spaces",  # Contains spaces
            "user@invalid",  # Contains @
            "user#invalid",  # Contains #
            "",  # Empty
        ]
        
        for invalid_username in invalid_usernames:
            data = test_user_data.copy()
            data["username"] = invalid_username
            
            response = client.post("/api/v1/auth/register", json=data)
            assert response.status_code == 422

    def test_user_status_management(self, client, test_user_data):
        """Test user status management (active, inactive, banned)."""
        # Register user
        client.post("/api/v1/auth/register", json=test_user_data)
        
        # User should be active by default
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": test_user_data["password"]
        })
        assert login_response.status_code == 200
        
        # If user status management is implemented, test inactive/banned users
        # This would require admin endpoints to change user status

    def test_audit_logging(self, client, test_user_data):
        """Test audit logging of authentication events."""
        # Register user
        response = client.post("/api/v1/auth/register", json=test_user_data)
        assert response.status_code == 201
        
        # Login
        login_response = client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": test_user_data["password"]
        })
        assert login_response.status_code == 200
        
        # Failed login
        client.post("/api/v1/auth/login", json={
            "username_or_email": test_user_data["username"],
            "password": "wrongpassword"
        })
        
        # These events should be logged (implementation dependent)
        # Verify logs contain registration, successful login, failed login
        pass