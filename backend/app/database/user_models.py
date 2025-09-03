"""User management models and database operations."""
import sqlite3
import hashlib
import secrets
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
from enum import Enum
try:
    from loguru import logger
except ImportError:
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    from simple_logger import logger
import bcrypt


class UserRole(str, Enum):
    """User roles for role-based access control."""
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"


class UserStatus(str, Enum):
    """User account status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


@dataclass
class User:
    """User model."""
    id: Optional[str] = None
    username: str = ""
    email: str = ""
    password_hash: str = ""
    role: UserRole = UserRole.USER
    status: UserStatus = UserStatus.ACTIVE
    first_name: str = ""
    last_name: str = ""
    profile_picture: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    settings: Optional[Dict[str, Any]] = None
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None


@dataclass
class UserSession:
    """User session model for JWT token management."""
    id: Optional[str] = None
    user_id: str = ""
    token_jti: str = ""
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    is_active: bool = True


class UserManager:
    """User management operations."""
    
    def __init__(self, db_path: str = "app_data.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_user_tables()
        self._create_default_admin()
    
    def _init_user_tables(self):
        """Initialize user-related database tables."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Users table
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        username TEXT UNIQUE NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        role TEXT NOT NULL DEFAULT 'user',
                        status TEXT NOT NULL DEFAULT 'active',
                        first_name TEXT,
                        last_name TEXT,
                        profile_picture TEXT,
                        last_login TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        settings TEXT,
                        failed_login_attempts INTEGER DEFAULT 0,
                        locked_until TIMESTAMP
                    )
                """)
                
                # User sessions table for JWT token management
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS user_sessions (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        token_jti TEXT UNIQUE NOT NULL,
                        expires_at TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        ip_address TEXT,
                        user_agent TEXT,
                        is_active BOOLEAN DEFAULT 1,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    )
                """)
                
                # Indexes
                conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token_jti ON user_sessions(token_jti)")
                conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at)")
                
                # Create audio_sessions table if it doesn't exist for foreign key
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS audio_sessions (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        original_filename TEXT,
                        file_path TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Update existing audio_sessions table to have proper user_id foreign key
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_audio_sessions_user_id 
                    ON audio_sessions(user_id)
                """)
                
                conn.commit()
                logger.info("User management tables initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize user tables: {e}")
            raise
    
    def _create_default_admin(self):
        """Create default admin user if none exists."""
        try:
            if not self.get_user_by_role(UserRole.ADMIN):
                # Create default admin with secure random password
                admin_password = secrets.token_urlsafe(16)
                admin_user = User(
                    username="admin",
                    email="admin@speechapp.local",
                    role=UserRole.ADMIN,
                    status=UserStatus.ACTIVE,
                    first_name="System",
                    last_name="Administrator"
                )
                
                user_id = self.create_user(admin_user, admin_password)
                
                # Log the admin credentials securely
                logger.warning(f"Default admin created - Username: admin, Password: {admin_password}")
                logger.warning("Please change the admin password immediately after first login!")
                
        except Exception as e:
            logger.error(f"Failed to create default admin: {e}")
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt."""
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash."""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception:
            return False
    
    def create_user(self, user: User, password: str) -> str:
        """Create new user."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                if not user.id:
                    import uuid
                    user.id = str(uuid.uuid4())
                
                user.password_hash = self.hash_password(password)
                user.created_at = datetime.now()
                user.updated_at = datetime.now()
                
                settings_json = json.dumps(user.settings) if user.settings else None
                
                conn.execute("""
                    INSERT INTO users 
                    (id, username, email, password_hash, role, status, first_name, 
                     last_name, profile_picture, created_at, updated_at, settings, 
                     failed_login_attempts, locked_until)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user.id, user.username, user.email, user.password_hash,
                    user.role.value, user.status.value, user.first_name,
                    user.last_name, user.profile_picture, user.created_at,
                    user.updated_at, settings_json, user.failed_login_attempts,
                    user.locked_until
                ))
                
                conn.commit()
                logger.info(f"User created successfully: {user.username} ({user.role})")
                return user.id
                
        except sqlite3.IntegrityError as e:
            if "username" in str(e):
                raise ValueError("Username already exists")
            elif "email" in str(e):
                raise ValueError("Email already exists")
            else:
                raise ValueError("User creation failed due to constraint violation")
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            raise
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
                row = cursor.fetchone()
                return self._row_to_user(row) if row else None
        except Exception as e:
            logger.error(f"Failed to get user by ID {user_id}: {e}")
            return None
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("SELECT * FROM users WHERE username = ?", (username,))
                row = cursor.fetchone()
                return self._row_to_user(row) if row else None
        except Exception as e:
            logger.error(f"Failed to get user by username {username}: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("SELECT * FROM users WHERE email = ?", (email,))
                row = cursor.fetchone()
                return self._row_to_user(row) if row else None
        except Exception as e:
            logger.error(f"Failed to get user by email {email}: {e}")
            return None
    
    def get_user_by_role(self, role: UserRole) -> List[User]:
        """Get users by role."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.execute("SELECT * FROM users WHERE role = ?", (role.value,))
                rows = cursor.fetchall()
                return [self._row_to_user(row) for row in rows if row]
        except Exception as e:
            logger.error(f"Failed to get users by role {role}: {e}")
            return []
    
    def authenticate_user(self, username_or_email: str, password: str, ip_address: str = None) -> Optional[User]:
        """Authenticate user with username/email and password."""
        try:
            # Try to find user by username or email
            user = (self.get_user_by_username(username_or_email) or 
                   self.get_user_by_email(username_or_email))
            
            if not user:
                logger.warning(f"Authentication failed - user not found: {username_or_email}")
                return None
            
            # Check if account is locked
            if user.locked_until and user.locked_until > datetime.now():
                logger.warning(f"Authentication failed - account locked: {user.username}")
                return None
            
            # Check if account is active
            if user.status != UserStatus.ACTIVE:
                logger.warning(f"Authentication failed - account not active: {user.username}")
                return None
            
            # Verify password
            if not self.verify_password(password, user.password_hash):
                self._handle_failed_login(user)
                logger.warning(f"Authentication failed - invalid password: {user.username}")
                return None
            
            # Reset failed login attempts and update last login
            self._handle_successful_login(user, ip_address)
            logger.info(f"User authenticated successfully: {user.username}")
            return user
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return None
    
    def _handle_failed_login(self, user: User):
        """Handle failed login attempt."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                user.failed_login_attempts += 1
                
                # Lock account after 5 failed attempts for 30 minutes
                if user.failed_login_attempts >= 5:
                    user.locked_until = datetime.now() + timedelta(minutes=30)
                    logger.warning(f"Account locked due to failed login attempts: {user.username}")
                
                conn.execute("""
                    UPDATE users SET failed_login_attempts = ?, locked_until = ?, updated_at = ?
                    WHERE id = ?
                """, (user.failed_login_attempts, user.locked_until, datetime.now(), user.id))
                
                conn.commit()
                
        except Exception as e:
            logger.error(f"Failed to handle failed login: {e}")
    
    def _handle_successful_login(self, user: User, ip_address: str = None):
        """Handle successful login."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                user.failed_login_attempts = 0
                user.locked_until = None
                user.last_login = datetime.now()
                user.updated_at = datetime.now()
                
                conn.execute("""
                    UPDATE users SET failed_login_attempts = 0, locked_until = NULL, 
                    last_login = ?, updated_at = ? WHERE id = ?
                """, (user.last_login, user.updated_at, user.id))
                
                conn.commit()
                
        except Exception as e:
            logger.error(f"Failed to handle successful login: {e}")
    
    def update_user(self, user: User) -> bool:
        """Update user information."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                user.updated_at = datetime.now()
                settings_json = json.dumps(user.settings) if user.settings else None
                
                conn.execute("""
                    UPDATE users SET username = ?, email = ?, role = ?, status = ?, 
                    first_name = ?, last_name = ?, profile_picture = ?, updated_at = ?, 
                    settings = ? WHERE id = ?
                """, (
                    user.username, user.email, user.role.value, user.status.value,
                    user.first_name, user.last_name, user.profile_picture,
                    user.updated_at, settings_json, user.id
                ))
                
                conn.commit()
                logger.info(f"User updated successfully: {user.username}")
                return True
                
        except sqlite3.IntegrityError as e:
            logger.error(f"User update failed due to constraint violation: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to update user: {e}")
            return False
    
    def change_password(self, user_id: str, new_password: str) -> bool:
        """Change user password."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                password_hash = self.hash_password(new_password)
                
                conn.execute("""
                    UPDATE users SET password_hash = ?, updated_at = ?, 
                    failed_login_attempts = 0, locked_until = NULL WHERE id = ?
                """, (password_hash, datetime.now(), user_id))
                
                conn.commit()
                logger.info(f"Password changed for user ID: {user_id}")
                return True
                
        except Exception as e:
            logger.error(f"Failed to change password: {e}")
            return False
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user and all associated data."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Delete user sessions first
                conn.execute("DELETE FROM user_sessions WHERE user_id = ?", (user_id,))
                
                # Delete user
                cursor = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
                
                if cursor.rowcount > 0:
                    conn.commit()
                    logger.info(f"User deleted successfully: {user_id}")
                    return True
                else:
                    logger.warning(f"No user found with ID: {user_id}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to delete user: {e}")
            return False
    
    def list_users(self, role: Optional[UserRole] = None, status: Optional[UserStatus] = None, 
                   limit: int = 100, offset: int = 0) -> List[User]:
        """List users with optional filtering."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                query = "SELECT * FROM users WHERE 1=1"
                params = []
                
                if role:
                    query += " AND role = ?"
                    params.append(role.value)
                
                if status:
                    query += " AND status = ?"
                    params.append(status.value)
                
                query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
                params.extend([limit, offset])
                
                cursor = conn.execute(query, params)
                rows = cursor.fetchall()
                
                return [self._row_to_user(row) for row in rows if row]
                
        except Exception as e:
            logger.error(f"Failed to list users: {e}")
            return []
    
    def _revoke_session(self, jti: str) -> bool:
        """Revoke a specific session by JWT ID."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    "UPDATE user_sessions SET is_active = 0 WHERE token_jti = ?",
                    (jti,)
                )
                conn.commit()
                return cursor.rowcount > 0
                
        except Exception as e:
            logger.error(f"Failed to revoke session: {e}")
            return False
    
    def _revoke_all_user_sessions(self, user_id: str) -> bool:
        """Revoke all sessions for a user."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    "UPDATE user_sessions SET is_active = 0 WHERE user_id = ?",
                    (user_id,)
                )
                conn.commit()
                return cursor.rowcount >= 0
                
        except Exception as e:
            logger.error(f"Failed to revoke all user sessions: {e}")
            return False
    
    def _row_to_user(self, row: sqlite3.Row) -> User:
        """Convert database row to User object."""
        settings = None
        if row['settings']:
            try:
                settings = json.loads(row['settings'])
            except json.JSONDecodeError:
                pass
        
        return User(
            id=row['id'],
            username=row['username'],
            email=row['email'],
            password_hash=row['password_hash'],
            role=UserRole(row['role']),
            status=UserStatus(row['status']),
            first_name=row['first_name'],
            last_name=row['last_name'],
            profile_picture=row['profile_picture'],
            last_login=datetime.fromisoformat(row['last_login']) if row['last_login'] else None,
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None,
            settings=settings,
            failed_login_attempts=row['failed_login_attempts'] or 0,
            locked_until=datetime.fromisoformat(row['locked_until']) if row['locked_until'] else None
        )


# Global user manager instance
_user_manager: Optional[UserManager] = None

def get_user_manager() -> UserManager:
    """Get or create global user manager instance."""
    global _user_manager
    if _user_manager is None:
        _user_manager = UserManager()
    return _user_manager