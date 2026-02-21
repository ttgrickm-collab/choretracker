"""User routes - list users for task assignment"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.auth import get_current_parent, get_current_user
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


@router.get("/me/balance")
async def get_my_balance(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's points balance from points_transactions ledger"""
    if current_user['role'] != 'kid':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only kids have points balances"
        )
    
    async with get_db() as db:
        async with db.execute(
            """
            SELECT COALESCE(SUM(amount), 0) as balance
            FROM points_transactions
            WHERE user_id = ?
            """,
            (current_user['id'],)
        ) as cursor:
            row = await cursor.fetchone()
            balance = row['balance'] if row else 0
    
    return {
        "user_id": current_user['id'],
        "balance": balance
    }


@router.get("/total/balance")
async def get_total_balance(
    current_user: dict = Depends(get_current_user)
):
    """Get total points balance for all users in the system"""
    async with get_db() as db:
        async with db.execute(
            """
            SELECT COALESCE(SUM(amount), 0) as total_balance
            FROM points_transactions
            """
        ) as cursor:
            row = await cursor.fetchone()
            total_balance = row['total_balance'] if row else 0
    
    return {
        "total_balance": total_balance
    }
