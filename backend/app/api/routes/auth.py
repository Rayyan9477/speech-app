"""Authentication and user management API routes."""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Request, Form
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field, validator
from loguru import logger

from ...database.user_models import User, UserRole, UserStatus, get_user_manager
from ...security.auth import (
    jwt_manager, get_current_user, get_current_active_user, 
    require_admin, require_admin_or_moderator, security
)


# Request/Response models
class UserRegistration(BaseModel):
    """User registration request."""
    username: str = Field(..., min_length=3, max_length=50, regex="^[a-zA-Z0-9_-]+$")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password complexity."""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v


class UserLogin(BaseModel):
    """User login request."""
    username_or_email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """Token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class UserResponse(BaseModel):
    """User response model."""
    id: str
    username: str
    email: str
    role: str
    status: str
    first_name: str
    last_name: str
    profile_picture: Optional[str]
    last_login: Optional[datetime]
    created_at: Optional[datetime]
    settings: Optional[dict]


class UserUpdate(BaseModel):
    """User update request."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    settings: Optional[dict] = None


class PasswordChange(BaseModel):
    """Password change request."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_password(cls, v):
        """Validate password complexity."""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v


class AdminUserCreate(BaseModel):
    """Admin user creation request."""
    username: str = Field(..., min_length=3, max_length=50, regex="^[a-zA-Z0-9_-]+$")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole
    status: UserStatus
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)


class AdminUserUpdate(BaseModel):
    """Admin user update request."""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)


# Router
router = APIRouter()


def user_to_dict(user: User) -> dict:
    """Convert User object to dictionary for response."""
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role.value,
        "status": user.status.value,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile_picture": user.profile_picture,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "settings": user.settings
    }


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegistration, request: Request):
    """Register new user."""
    try:
        user_manager = get_user_manager()
        
        # Check if username or email already exists
        if user_manager.get_user_by_username(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists"
            )
        
        if user_manager.get_user_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists"
            )
        
        # Create new user
        user = User(
            username=user_data.username,
            email=user_data.email,
            role=UserRole.USER,
            status=UserStatus.ACTIVE,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        
        user_id = user_manager.create_user(user, user_data.password)
        created_user = user_manager.get_user_by_id(user_id)
        
        logger.info(f"New user registered: {user_data.username}")
        
        return {
            "message": "User registered successfully",
            "user": user_to_dict(created_user)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=TokenResponse)
async def login_user(login_data: UserLogin, request: Request):
    """Login user and return JWT tokens."""
    try:
        user_manager = get_user_manager()
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
        
        # Authenticate user
        user = user_manager.authenticate_user(
            login_data.username_or_email,
            login_data.password,
            client_ip
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password"
            )
        
        # Create tokens
        access_token = jwt_manager.create_access_token(user, client_ip, user_agent)
        refresh_token = jwt_manager.create_refresh_token(user)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=jwt_manager.access_token_expire_minutes * 60,
            user=user_to_dict(user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/refresh", response_model=dict)
async def refresh_token(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Refresh access token using refresh token."""
    try:
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
        
        new_access_token = jwt_manager.refresh_access_token(
            credentials.credentials,
            client_ip,
            user_agent
        )
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": jwt_manager.access_token_expire_minutes * 60
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout")
async def logout_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user and revoke token."""
    try:
        payload = jwt_manager.verify_token(credentials.credentials)
        jti = payload.get("jti")
        
        if jwt_manager.revoke_token(jti):
            return {"message": "Logged out successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Logout failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.post("/logout-all")
async def logout_all_sessions(current_user: User = Depends(get_current_active_user)):
    """Logout user from all sessions."""
    try:
        if jwt_manager.revoke_all_user_tokens(current_user.id):
            return {"message": "Logged out from all sessions successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Logout from all sessions failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout all sessions failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout all sessions failed"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return UserResponse(**user_to_dict(current_user))


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update current user information."""
    try:
        user_manager = get_user_manager()
        
        # Update user fields
        if user_update.first_name is not None:
            current_user.first_name = user_update.first_name
        if user_update.last_name is not None:
            current_user.last_name = user_update.last_name
        if user_update.email is not None:
            # Check if email is already taken by another user
            existing_user = user_manager.get_user_by_email(user_update.email)
            if existing_user and existing_user.id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already exists"
                )
            current_user.email = user_update.email
        if user_update.settings is not None:
            current_user.settings = user_update.settings
        
        # Update user in database
        if user_manager.update_user(current_user):
            updated_user = user_manager.get_user_by_id(current_user.id)
            return UserResponse(**user_to_dict(updated_user))
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User update failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User update failed"
        )


@router.put("/me/password")
async def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_active_user)
):
    """Change current user's password."""
    try:
        user_manager = get_user_manager()
        
        # Verify current password
        if not user_manager.verify_password(password_change.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Change password
        if user_manager.change_password(current_user.id, password_change.new_password):
            # Revoke all existing sessions to force re-login
            jwt_manager.revoke_all_user_tokens(current_user.id)
            return {"message": "Password changed successfully. Please login again."}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to change password"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )


# Admin endpoints
@router.get("/admin/users", response_model=List[UserResponse])
async def list_users(
    role: Optional[UserRole] = None,
    status: Optional[UserStatus] = None,
    limit: int = 100,
    offset: int = 0,
    admin_user: User = Depends(require_admin)
):
    """List users (admin only)."""
    try:
        user_manager = get_user_manager()
        users = user_manager.list_users(role, status, limit, offset)
        return [UserResponse(**user_to_dict(user)) for user in users]
        
    except Exception as e:
        logger.error(f"Failed to list users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users"
        )


@router.post("/admin/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_admin(
    user_data: AdminUserCreate,
    admin_user: User = Depends(require_admin)
):
    """Create user (admin only)."""
    try:
        user_manager = get_user_manager()
        
        # Check if username or email already exists
        if user_manager.get_user_by_username(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists"
            )
        
        if user_manager.get_user_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists"
            )
        
        # Create new user
        user = User(
            username=user_data.username,
            email=user_data.email,
            role=user_data.role,
            status=user_data.status,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        
        user_id = user_manager.create_user(user, user_data.password)
        created_user = user_manager.get_user_by_id(user_id)
        
        logger.info(f"User created by admin {admin_user.username}: {user_data.username}")
        return UserResponse(**user_to_dict(created_user))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin user creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User creation failed"
        )


@router.get("/admin/users/{user_id}", response_model=UserResponse)
async def get_user_admin(
    user_id: str,
    admin_user: User = Depends(require_admin_or_moderator)
):
    """Get user by ID (admin/moderator only)."""
    try:
        user_manager = get_user_manager()
        user = user_manager.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**user_to_dict(user))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user"
        )


@router.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: str,
    user_update: AdminUserUpdate,
    admin_user: User = Depends(require_admin)
):
    """Update user (admin only)."""
    try:
        user_manager = get_user_manager()
        user = user_manager.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user fields
        if user_update.username is not None:
            existing_user = user_manager.get_user_by_username(user_update.username)
            if existing_user and existing_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already exists"
                )
            user.username = user_update.username
            
        if user_update.email is not None:
            existing_user = user_manager.get_user_by_email(user_update.email)
            if existing_user and existing_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already exists"
                )
            user.email = user_update.email
            
        if user_update.role is not None:
            user.role = user_update.role
        if user_update.status is not None:
            user.status = user_update.status
        if user_update.first_name is not None:
            user.first_name = user_update.first_name
        if user_update.last_name is not None:
            user.last_name = user_update.last_name
        
        # Update user in database
        if user_manager.update_user(user):
            updated_user = user_manager.get_user_by_id(user_id)
            logger.info(f"User updated by admin {admin_user.username}: {user.username}")
            return UserResponse(**user_to_dict(updated_user))
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin user update failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User update failed"
        )


@router.delete("/admin/users/{user_id}")
async def delete_user_admin(
    user_id: str,
    admin_user: User = Depends(require_admin)
):
    """Delete user (admin only)."""
    try:
        user_manager = get_user_manager()
        
        # Prevent admin from deleting themselves
        if user_id == admin_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        user = user_manager.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user_manager.delete_user(user_id):
            logger.info(f"User deleted by admin {admin_user.username}: {user.username}")
            return {"message": "User deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete user"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin user deletion failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User deletion failed"
        )