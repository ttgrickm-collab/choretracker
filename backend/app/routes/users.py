"""User routes - list users for task assignment"""
from fastapi import APIRouter, Depends
from typing import List

from app.auth import get_current_parent
from app.database import get_db


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/kids", response_model=List[dict])
async def get_kids(current_user: dict = Depends(get_current_parent)):
    """List all kid users (parent only)"""
    async with get_db() as db:
        async with db.execute(
            "SELECT id, username, display_name FROM users WHERE role = 'kid' ORDER BY display_name"
        ) as cursor:
            kids = await cursor.fetchall()
    return [dict(k) for k in kids]
