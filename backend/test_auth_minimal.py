#!/usr/bin/env python3
"""
Minimal test script to verify the authentication system works.
"""
import os
import sys
import tempfile
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def main():
    print("Testing User Management System...")
    
    try:
        # Test direct imports
        from app.database.user_models import UserManager, User, UserRole, UserStatus
        print("SUCCESS: User models imported")
        
        # Test authentication
        from app.security.auth import JWTManager
        print("SUCCESS: JWT manager imported")
        
        # Use temporary database for testing
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_db:
            db_path = tmp_db.name
        
        try:
            # Initialize user manager with test database
            user_manager = UserManager(db_path)
            print("SUCCESS: UserManager initialized")
            
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
            print(f"SUCCESS: User created with ID: {user_id}")
            
            # Test user retrieval
            retrieved_user = user_manager.get_user_by_id(user_id)
            if retrieved_user and retrieved_user.username == "testuser":
                print("SUCCESS: User retrieval works")
            else:
                print("ERROR: User retrieval failed")
                return False
            
            # Test authentication
            auth_user = user_manager.authenticate_user("testuser", "TestPassword123!")
            if auth_user and auth_user.username == "testuser":
                print("SUCCESS: User authentication works")
            else:
                print("ERROR: User authentication failed")
                return False
            
            # Test wrong password
            wrong_auth = user_manager.authenticate_user("testuser", "WrongPassword")
            if wrong_auth is None:
                print("SUCCESS: Wrong password correctly rejected")
            else:
                print("ERROR: Wrong password was accepted")
                return False
            
            # Test JWT token creation
            jwt_manager = JWTManager()
            token = jwt_manager.create_access_token(auth_user)
            if token:
                print(f"SUCCESS: JWT token created: {token[:50]}...")
            else:
                print("ERROR: JWT token creation failed")
                return False
            
            # Test token verification
            payload = jwt_manager.verify_token(token)
            if payload and payload.get('username') == "testuser":
                print("SUCCESS: JWT token verification works")
            else:
                print("ERROR: JWT token verification failed")
                return False
            
            print("\nALL TESTS PASSED!")
            print("\nNext steps:")
            print("1. Start the backend: python main.py")
            print("2. Open http://localhost:8000/docs to see API documentation")
            print("3. Default admin credentials will be shown in server logs")
            return True
            
        except Exception as e:
            print(f"ERROR: Test failed: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        finally:
            # Cleanup test database
            try:
                os.unlink(db_path)
                print("Cleaned up test database")
            except:
                pass
    
    except ImportError as e:
        print(f"IMPORT ERROR: {e}")
        print("Some dependencies may be missing. The system may still work with partial functionality.")
        return False
    
    except Exception as e:
        print(f"UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)