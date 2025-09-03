#!/usr/bin/env python3
"""
Test script to verify the user management system works correctly.
"""
import os
import sys
import asyncio
import tempfile
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from app.database.user_models import UserManager, User, UserRole, UserStatus
    from app.security.auth import JWTManager
    
    def test_user_management():
        """Test basic user management functionality."""
        print("🔍 Testing User Management System...")
        
        # Use temporary database for testing
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_db:
            db_path = tmp_db.name
        
        try:
            # Initialize user manager with test database
            user_manager = UserManager(db_path)
            print("✅ UserManager initialized successfully")
            
            # Test user creation
            test_user = User(
                username="testuser",
                email="test@example.com",
                role=UserRole.USER,
                status=UserStatus.ACTIVE,
                first_name="Test",
                last_name="User"
            )
            
            user_id = user_manager.create_user(test_user, "TestPassword123!")
            print(f"✅ User created with ID: {user_id}")
            
            # Test user retrieval
            retrieved_user = user_manager.get_user_by_id(user_id)
            assert retrieved_user is not None
            assert retrieved_user.username == "testuser"
            print("✅ User retrieval successful")
            
            # Test authentication
            auth_user = user_manager.authenticate_user("testuser", "TestPassword123!")
            assert auth_user is not None
            assert auth_user.username == "testuser"
            print("✅ User authentication successful")
            
            # Test wrong password
            wrong_auth = user_manager.authenticate_user("testuser", "WrongPassword")
            assert wrong_auth is None
            print("✅ Wrong password correctly rejected")
            
            # Test JWT token creation
            jwt_manager = JWTManager()
            token = jwt_manager.create_access_token(auth_user)
            print(f"✅ JWT token created: {token[:50]}...")
            
            # Test token verification
            payload = jwt_manager.verify_token(token)
            assert payload['username'] == "testuser"
            print("✅ JWT token verification successful")
            
            print("\n🎉 All user management tests passed!")
            return True
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        finally:
            # Cleanup test database
            try:
                os.unlink(db_path)
                print("🧹 Test database cleaned up")
            except:
                pass
    
    def test_security_features():
        """Test security features."""
        print("\n🔐 Testing Security Features...")
        
        try:
            from app.security.encryption import FileEncryption
            
            # Test encryption with a test key
            test_key = "test-encryption-key-32-chars-minimum"
            encryptor = FileEncryption(test_key)
            print("✅ Encryption system initialized")
            
            # Test data encryption
            test_data = b"This is test audio data"
            encrypted_data = encryptor.encrypt_data(test_data)
            decrypted_data = encryptor.decrypt_data(encrypted_data)
            
            assert decrypted_data == test_data
            print("✅ Data encryption/decryption successful")
            
            print("🎉 Security tests passed!")
            return True
            
        except Exception as e:
            print(f"❌ Security test failed: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def main():
        """Run all tests."""
        print("🚀 Starting User Management System Tests...\n")
        
        # Run tests
        user_test_passed = test_user_management()
        security_test_passed = test_security_features()
        
        # Summary
        print("\n📊 Test Summary:")
        print(f"User Management: {'✅ PASSED' if user_test_passed else '❌ FAILED'}")
        print(f"Security Features: {'✅ PASSED' if security_test_passed else '❌ FAILED'}")
        
        if user_test_passed and security_test_passed:
            print("\n🎉 All tests passed! The user management system is ready.")
            print("\n📋 Next steps:")
            print("1. Start the backend: cd backend && python main.py")
            print("2. Start the frontend: cd frontend && npm run dev")
            print("3. Open http://localhost:3000 and try logging in")
            print("4. Default admin credentials will be shown in server logs")
            return True
        else:
            print("\n❌ Some tests failed. Please check the errors above.")
            return False

    if __name__ == "__main__":
        success = main()
        sys.exit(0 if success else 1)

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please ensure all dependencies are installed:")
    print("pip install fastapi uvicorn PyJWT bcrypt cryptography python-multipart pydantic-settings")
    sys.exit(1)