"""User model and utilities"""
import bcrypt
import sqlite3
from app.config import settings
from typing import Optional


class User:
    """User model with password management"""
    
    def __init__(self, username: str, role: str, display_name: str, user_id: int = None, password_hash: str = None, created_at: str = None):
        self.id = user_id
        self.username = username
        self.role = role
        self.display_name = display_name
        self._password_hash = password_hash
        self._created_at = created_at
    
    def __repr__(self) -> str:
        """Developer-friendly representation"""
        return f"User(id={self.id}, username='{self.username}', role='{self.role}')"
    
    def __str__(self) -> str:
        """User-friendly representation"""
        return f"{self.display_name} ({self.role})"
    
    @property
    def password(self):
        """Password cannot be read"""
        raise AttributeError('Password is not a readable attribute')
    
    @password.setter
    def password(self, plain_password: str):
        """Set password - automatically hashes it"""
        password_bytes = plain_password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        self._password_hash = hashed.decode('utf-8')
    
    def verify_password(self, plain_password: str) -> bool:
        """Verify a password against the stored hash"""
        if not self._password_hash:
            return False
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = self._password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    
    def save(self, db_path: str = None) -> int:
        """Save user to database"""
        if db_path is None:
            db_path = settings.DATABASE_URL
        
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            
            if self.id is None:
                # Create new user
                cursor.execute(
                    """
                    INSERT INTO users (username, password_hash, role, display_name)
                    VALUES (?, ?, ?, ?)
                    """,
                    (self.username, self._password_hash, self.role, self.display_name)
                )
                self.id = cursor.lastrowid
            else:
                # Update existing user
                cursor.execute(
                    """
                    UPDATE users 
                    SET username = ?, password_hash = ?, role = ?, display_name = ?
                    WHERE id = ?
                    """,
                    (self.username, self._password_hash, self.role, self.display_name, self.id)
                )
            
            conn.commit()
        
        return self.id
    
    @classmethod
    def get_by_username(cls, username: str, db_path: str = None) -> Optional['User']:
        """Load user from database by username"""
        if db_path is None:
            db_path = settings.DATABASE_URL
        
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, username, password_hash, role, display_name, created_at FROM users WHERE username = ?",
                (username,)
            )
            row = cursor.fetchone()
        
        if not row:
            return None
        
        return cls(
            user_id=row[0],
            username=row[1],
            role=row[3],
            display_name=row[4],
            password_hash=row[2],
            created_at=row[5]
        )
    
    @classmethod
    def get_by_id(cls, user_id: int, db_path: str = None) -> Optional['User']:
        """Load user from database by ID"""
        if db_path is None:
            db_path = settings.DATABASE_URL
        
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, username, password_hash, role, display_name, created_at FROM users WHERE id = ?",
                (user_id,)
            )
            row = cursor.fetchone()
        
        if not row:
            return None
        
        return cls(
            user_id=row[0],
            username=row[1],
            role=row[3],
            display_name=row[4],
            password_hash=row[2],
            created_at=row[5]
        )


# Standalone utility functions for backwards compatibility
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


if __name__ == "__main__":
    """
    Run this file directly to manage users:
    python -m app.utils.user
    """
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Create user: python -m app.utils.user create <username> <password> <role> <display_name>")
        print("  Set password: python -m app.utils.user setpass <username> <new_password>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "create":
        if len(sys.argv) != 6:
            print("Usage: python -m app.utils.user create <username> <password> <role> <display_name>")
            sys.exit(1)
        
        username = sys.argv[2]
        password = sys.argv[3]
        role = sys.argv[4]
        display_name = sys.argv[5]
        
        user = User(username=username, role=role, display_name=display_name)
        user.password = password  # Uses @password.setter
        user_id = user.save()
        
        print(f"✓ Created user '{username}' with ID {user_id}")
    
    elif command == "setpass":
        if len(sys.argv) != 4:
            print("Usage: python -m app.utils.user setpass <username> <new_password>")
            sys.exit(1)
        
        username = sys.argv[2]
        password = sys.argv[3]
        
        user = User.get_by_username(username)
        if user:
            user.password = password  # Uses @password.setter
            user.save()
            print(f"✓ Password updated for '{username}'")
        else:
            print(f"✗ User '{username}' not found")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
