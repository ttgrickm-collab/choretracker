from fastapi import APIRouter, HTTPException, status
from app.models.user import LoginRequest, LoginResponse, UserResponse
from app.auth import create_access_token
from app.utils.user import User


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Login endpoint - returns JWT token"""
    # Load user using User class
    user = User.get_by_username(credentials.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Verify password using User instance method
    if not user.verify_password(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"user_id": user.id})
    
    # Return token and user info
    user_response = UserResponse(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        role=user.role,
        created_at=user._created_at
    )
    
    return LoginResponse(
        access_token=access_token,
        user=user_response
    )
