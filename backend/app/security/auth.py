"""JWT Authentication and authorization utilities."""
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
try:
    from loguru import logger
except ImportError:
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    from simple_logger import logger
try:
    from ..database.user_models import User, UserRole, get_user_manager
except ImportError:
    # Direct import for testing
    import sys
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'database'))
    from user_models import User, UserRole, get_user_manager


class JWTManager:
    """JWT token management."""
    
    def __init__(self, secret_key: str = None, algorithm: str = "HS256"):
        # Use provided secret key or generate a secure one
        self.secret_key = secret_key or self._get_secure_secret_key()
        self.algorithm = algorithm
        self.access_token_expire_minutes = 60 * 24 * 7  # 7 days
        self.refresh_token_expire_days = 30
    
    def _get_secure_secret_key(self) -> str:
        """Get or generate a secure secret key."""
        # Try to get from environment first
        env_key = os.getenv("JWT_SECRET_KEY")
        if env_key and len(env_key) >= 32:
            return env_key
        
        # Generate a secure random key
        key = secrets.token_urlsafe(32)
        logger.warning("Using generated JWT secret key. Set JWT_SECRET_KEY environment variable for production!")
        return key
    
    def create_access_token(self, user: User, ip_address: str = None, user_agent: str = None) -> str:
        """Create JWT access token for user."""
        try:
            now = datetime.now(timezone.utc)
            expire = now + timedelta(minutes=self.access_token_expire_minutes)
            jti = secrets.token_urlsafe(16)  # JWT ID for token blacklisting
            
            payload = {
                "sub": user.id,  # Subject (user ID)
                "username": user.username,
                "email": user.email,
                "role": user.role.value,
                "status": user.status.value,
                "iat": now,  # Issued at
                "exp": expire,  # Expiry
                "jti": jti,  # JWT ID
                "type": "access"
            }
            
            # Store session in database for token management
            self._store_session(user.id, jti, expire, ip_address, user_agent)
            
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            logger.info(f"Access token created for user: {user.username}")
            return token
            
        except Exception as e:
            logger.error(f"Failed to create access token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token creation failed"
            )
    
    def create_refresh_token(self, user: User) -> str:
        """Create JWT refresh token for user."""
        try:
            now = datetime.now(timezone.utc)
            expire = now + timedelta(days=self.refresh_token_expire_days)
            jti = secrets.token_urlsafe(16)
            
            payload = {
                "sub": user.id,
                "username": user.username,
                "iat": now,
                "exp": expire,
                "jti": jti,
                "type": "refresh"
            }
            
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            logger.info(f"Refresh token created for user: {user.username}")
            return token
            
        except Exception as e:
            logger.error(f"Failed to create refresh token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token creation failed"
            )
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Check if token is blacklisted (session inactive)
            if not self._is_session_active(payload.get("jti")):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token verification failed"
            )
    
    def refresh_access_token(self, refresh_token: str, ip_address: str = None, user_agent: str = None) -> str:
        """Create new access token using refresh token."""
        try:
            payload = self.verify_token(refresh_token)
            
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            user_manager = get_user_manager()
            user = user_manager.get_user_by_id(payload["sub"])
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Create new access token
            return self.create_access_token(user, ip_address, user_agent)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Token refresh failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token refresh failed"
            )
    
    def revoke_token(self, jti: str) -> bool:
        """Revoke token by marking session as inactive."""
        try:
            user_manager = get_user_manager()
            return user_manager._revoke_session(jti)
        except Exception as e:
            logger.error(f"Failed to revoke token: {e}")
            return False
    
    def revoke_all_user_tokens(self, user_id: str) -> bool:
        """Revoke all tokens for a user."""
        try:
            user_manager = get_user_manager()
            return user_manager._revoke_all_user_sessions(user_id)
        except Exception as e:
            logger.error(f"Failed to revoke all user tokens: {e}")
            return False
    
    def _store_session(self, user_id: str, jti: str, expires_at: datetime, 
                      ip_address: str = None, user_agent: str = None):
        """Store session in database."""
        try:
            import sqlite3
            import uuid
            
            session_id = str(uuid.uuid4())
            
            with sqlite3.connect("app_data.db") as conn:
                conn.execute("""
                    INSERT INTO user_sessions 
                    (id, user_id, token_jti, expires_at, ip_address, user_agent, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (session_id, user_id, jti, expires_at, ip_address, user_agent, True))
                conn.commit()
                
        except Exception as e:
            logger.error(f"Failed to store session: {e}")
    
    def _is_session_active(self, jti: str) -> bool:
        """Check if session is active."""
        try:
            import sqlite3
            
            with sqlite3.connect("app_data.db") as conn:
                cursor = conn.execute(
                    "SELECT is_active FROM user_sessions WHERE token_jti = ? AND expires_at > ?",
                    (jti, datetime.now(timezone.utc))
                )
                result = cursor.fetchone()
                return bool(result and result[0])
                
        except Exception as e:
            logger.error(f"Failed to check session status: {e}")
            return False


# Security dependencies
security = HTTPBearer()
jwt_manager = JWTManager()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user."""
    try:
        payload = jwt_manager.verify_token(credentials.credentials)
        user_manager = get_user_manager()
        user = user_manager.get_user_by_id(payload["sub"])
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user."""
    if current_user.status.value != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    return current_user


def require_role(required_role: UserRole):
    """Dependency to require specific user role."""
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. {required_role.value} role required"
            )
        return current_user
    return role_checker


def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Dependency to require admin role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin role required"
        )
    return current_user


def require_admin_or_moderator(current_user: User = Depends(get_current_active_user)) -> User:
    """Dependency to require admin or moderator role."""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin or moderator role required"
        )
    return current_user


async def get_optional_user(request: Request) -> Optional[User]:
    """Get current user if authenticated, otherwise None."""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        payload = jwt_manager.verify_token(token)
        
        user_manager = get_user_manager()
        return user_manager.get_user_by_id(payload["sub"])
        
    except Exception:
        return None


# Rate limiting decorator (basic implementation)
def rate_limit(max_attempts: int = 5, window_minutes: int = 15):
    """Basic rate limiting decorator."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Basic rate limiting logic would go here
            # For now, just pass through
            return func(*args, **kwargs)
        return wrapper
    return decorator