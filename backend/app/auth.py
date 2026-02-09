from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import get_db
from app.utils.user import verify_password


security = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Dependency to get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    async with get_db() as db:
        async with db.execute(
            "SELECT id, username, role, display_name FROM users WHERE id = ?",
            (user_id,)
        ) as cursor:
            user = await cursor.fetchone()
    
    if user is None:
        raise credentials_exception
    
    return dict(user)


async def get_current_parent(current_user: dict = Depends(get_current_user)):
    """Dependency to ensure user is a parent"""
    if current_user["role"] != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can perform this action"
        )
    return current_user


async def get_current_kid(current_user: dict = Depends(get_current_user)):
    """Dependency to ensure user is a kid"""
    if current_user["role"] != "kid":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only kids can perform this action"
        )
    return current_user
