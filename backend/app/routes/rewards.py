"""Rewards routes - tier-based reward system with redemption lifecycle"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone

from app.auth import get_current_parent, get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/rewards", tags=["rewards"])


# ============================================================================
# HELPERS
# ============================================================================

def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _get_user_balance(db, user_id: int) -> int:
    async with db.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM points_transactions WHERE user_id = ?",
        (user_id,)
    ) as cur:
        row = await cur.fetchone()
    return row[0] if row else 0


# ============================================================================
# KID ENDPOINTS
# ============================================================================

@router.get("/available")
async def get_available_tiers(current_user: dict = Depends(get_current_user)):
    """All active tiers with their active rewards and kid's current balance."""
    if current_user["role"] != "kid":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Kids only")

    async with get_db() as db:
        balance = await _get_user_balance(db, current_user["id"])

        async with db.execute(
            """
            SELECT id, title, description, icon_path, cost, display_order
            FROM reward_tiers
            WHERE active = 1
            ORDER BY display_order DESC, cost DESC
            """
        ) as cur:
            tiers = [dict(r) for r in await cur.fetchall()]

        for tier in tiers:
            async with db.execute(
                """
                SELECT id, title, description, icon_path, quantity
                FROM rewards
                WHERE tier_id = ? AND active = 1
                ORDER BY title
                """,
                (tier["id"],)
            ) as cur:
                tier["rewards"] = [dict(r) for r in await cur.fetchall()]

    return {"tiers": tiers, "balance": balance}


@router.get("/pending-claim")
async def get_pending_claim(current_user: dict = Depends(get_current_user)):
    """
    Check if this kid has a pending_cargo redemption (purchased tier, no cargo selected yet).
    Frontend uses this on mount to force cargo selection modal open.
    """
    if current_user["role"] != "kid":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Kids only")

    async with get_db() as db:
        async with db.execute(
            """
            SELECT rr.id, rr.tier_id, rr.points_spent,
                   rt.title as tier_title, rt.icon_path as tier_icon_path
            FROM reward_redemptions rr
            JOIN reward_tiers rt ON rr.tier_id = rt.id
            WHERE rr.redeemed_by = ? AND rr.status = 'pending_cargo'
            ORDER BY rr.awarded_at DESC
            LIMIT 1
            """,
            (current_user["id"],)
        ) as cur:
            row = await cur.fetchone()

    if not row:
        return {"pending": False}

    redemption = dict(row)

    # Also fetch the available rewards for that tier so the modal can render
    async with get_db() as db:
        async with db.execute(
            """
            SELECT id, title, description, icon_path, quantity
            FROM rewards
            WHERE tier_id = ? AND active = 1
            ORDER BY title
            """,
            (redemption["tier_id"],)
        ) as cur:
            rewards = [dict(r) for r in await cur.fetchall()]

    return {"pending": True, "redemption": redemption, "rewards": rewards}


@router.post("/tiers/{tier_id}/purchase")
async def purchase_tier(tier_id: int, current_user: dict = Depends(get_current_user)):
    """
    Kid purchases a tier (destination).
    Deducts fuel immediately, creates redemption row with status='pending_cargo'.
    Kid must then call /redemptions/{id}/claim to select cargo.
    """
    if current_user["role"] != "kid":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Kids only")

    async with get_db() as db:
        # Check for existing pending_cargo — can't double-purchase
        async with db.execute(
            "SELECT id FROM reward_redemptions WHERE redeemed_by = ? AND status = 'pending_cargo'",
            (current_user["id"],)
        ) as cur:
            if await cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You have a pending cargo selection. Select your cargo before purchasing again."
                )

        # Fetch tier
        async with db.execute(
            "SELECT id, title, cost, active FROM reward_tiers WHERE id = ?",
            (tier_id,)
        ) as cur:
            tier = await cur.fetchone()

        if not tier or not tier["active"]:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")

        # Check balance
        balance = await _get_user_balance(db, current_user["id"])
        if balance < tier["cost"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient fuel. Need {tier['cost']}, have {balance}."
            )

        # Deduct fuel
        await db.execute(
            """
            INSERT INTO points_transactions (user_id, amount, transaction_type, description)
            VALUES (?, ?, 'shop_purchase', ?)
            """,
            (current_user["id"], -tier["cost"], f"Traveled to: {tier['title']}")
        )

        # Create pending_cargo redemption (reward_id NULL until claimed)
        async with db.execute(
            """
            INSERT INTO reward_redemptions
                (reward_id, redeemed_by, tier_id, points_spent, status)
            VALUES (NULL, ?, ?, ?, 'pending_cargo')
            """,
            (current_user["id"], tier_id, tier["cost"])
        ) as cur:
            redemption_id = cur.lastrowid

        await db.commit()

    return {
        "success": True,
        "redemption_id": redemption_id,
        "message": f"Fuel deducted. Select your cargo to complete the journey.",
        "points_spent": tier["cost"]
    }


@router.post("/redemptions/{redemption_id}/claim")
async def claim_cargo(
    redemption_id: int,
    payload: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Kid selects cargo for a pending_cargo redemption.
    Sets reward_id and transitions status to 'awarded'.
    Body: { "reward_id": <int> }
    """
    if current_user["role"] != "kid":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Kids only")

    reward_id = payload.get("reward_id")
    if not reward_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="reward_id required")

    async with get_db() as db:
        # Fetch redemption
        async with db.execute(
            "SELECT * FROM reward_redemptions WHERE id = ? AND redeemed_by = ?",
            (redemption_id, current_user["id"])
        ) as cur:
            redemption = await cur.fetchone()

        if not redemption:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Redemption not found")
        if dict(redemption)["status"] != "pending_cargo":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cargo already selected for this redemption"
            )

        # Validate reward belongs to this tier and is active
        async with db.execute(
            "SELECT id, title, quantity, tier_id FROM rewards WHERE id = ? AND active = 1",
            (reward_id,)
        ) as cur:
            reward = await cur.fetchone()

        if not reward:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cargo item not found")

        reward_dict = dict(reward)
        if reward_dict["tier_id"] != dict(redemption)["tier_id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cargo not available at this destination"
            )

        # Check quantity
        if reward_dict["quantity"] is not None and reward_dict["quantity"] <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This cargo item is out of stock"
            )

        # Update redemption: set reward_id, transition to awarded
        await db.execute(
            """
            UPDATE reward_redemptions
            SET reward_id = ?, status = 'awarded', awarded_at = ?
            WHERE id = ?
            """,
            (reward_id, now_utc(), redemption_id)
        )

        # Decrement quantity if limited
        if reward_dict["quantity"] is not None:
            await db.execute(
                "UPDATE rewards SET quantity = quantity - 1 WHERE id = ?",
                (reward_id,)
            )

        await db.commit()

    return {
        "success": True,
        "message": f"Cargo secured: {reward_dict['title']}",
        "reward_title": reward_dict["title"]
    }


@router.get("/my-cargo")
async def get_my_cargo(current_user: dict = Depends(get_current_user)):
    """Kid's cargo hold — awarded and redeemed items."""
    if current_user["role"] != "kid":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Kids only")

    async with get_db() as db:
        async with db.execute(
            """
            SELECT
                rr.id, rr.status, rr.points_spent, rr.awarded_at,
                rr.redeemed_at, rr.fulfilled_at,
                r.title as reward_title, r.description as reward_description,
                r.icon_path as reward_icon_path,
                rt.title as tier_title
            FROM reward_redemptions rr
            JOIN rewards r ON rr.reward_id = r.id
            JOIN reward_tiers rt ON rr.tier_id = rt.id
            WHERE rr.redeemed_by = ?
              AND rr.status IN ('awarded', 'redeemed', 'fulfilled')
            ORDER BY rr.awarded_at DESC
            """,
            (current_user["id"],)
        ) as cur:
            items = [dict(r) for r in await cur.fetchall()]

    return items


@router.post("/redemptions/{redemption_id}/redeem")
async def redeem_cargo(redemption_id: int, current_user: dict = Depends(get_current_user)):
    """Kid submits cargo for fulfillment. awarded → redeemed."""
    if current_user["role"] != "kid":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Kids only")

    async with get_db() as db:
        async with db.execute(
            "SELECT * FROM reward_redemptions WHERE id = ? AND redeemed_by = ?",
            (redemption_id, current_user["id"])
        ) as cur:
            redemption = await cur.fetchone()

        if not redemption:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

        if dict(redemption)["status"] != "awarded":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only awarded cargo can be redeemed"
            )

        await db.execute(
            "UPDATE reward_redemptions SET status = 'redeemed', redeemed_at = ? WHERE id = ?",
            (now_utc(), redemption_id)
        )
        await db.commit()

    return {"success": True, "message": "Cargo submitted for fulfillment."}


# ============================================================================
# PARENT ENDPOINTS — TIERS
# ============================================================================

@router.get("/tiers")
async def get_tiers(current_user: dict = Depends(get_current_parent)):
    """All tiers with their rewards and redemption counts."""
    async with get_db() as db:
        async with db.execute(
            "SELECT * FROM reward_tiers ORDER BY display_order DESC, cost DESC"
        ) as cur:
            tiers = [dict(r) for r in await cur.fetchall()]

        for tier in tiers:
            async with db.execute(
                "SELECT * FROM rewards WHERE tier_id = ? ORDER BY title",
                (tier["id"],)
            ) as cur:
                tier["rewards"] = [dict(r) for r in await cur.fetchall()]

            async with db.execute(
                "SELECT COUNT(*) FROM reward_redemptions WHERE tier_id = ? AND status != 'pending_cargo'",
                (tier["id"],)
            ) as cur:
                row = await cur.fetchone()
            tier["redemption_count"] = row[0] if row else 0

    return tiers


@router.post("/tiers")
async def create_tier(payload: dict, current_user: dict = Depends(get_current_parent)):
    """Create a new reward tier."""
    title = payload.get("title", "").strip()
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title required")

    cost = payload.get("cost")
    if cost is None or int(cost) < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cost must be >= 1")

    async with get_db() as db:
        async with db.execute(
            """
            INSERT INTO reward_tiers (title, description, icon_path, cost, display_order, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                title,
                payload.get("description"),
                payload.get("icon_path"),
                int(cost),
                int(payload.get("display_order", 0)),
                current_user["id"]
            )
        ) as cur:
            tier_id = cur.lastrowid
        await db.commit()

    return {"id": tier_id, "message": "Destination created"}


@router.put("/tiers/{tier_id}")
async def update_tier(
    tier_id: int,
    payload: dict,
    current_user: dict = Depends(get_current_parent)
):
    """Update a reward tier."""
    async with get_db() as db:
        async with db.execute("SELECT id FROM reward_tiers WHERE id = ?", (tier_id,)) as cur:
            if not await cur.fetchone():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

        fields = []
        values = []
        for field in ("title", "description", "icon_path", "cost", "display_order", "active"):
            if field in payload:
                fields.append(f"{field} = ?")
                values.append(payload[field])

        if not fields:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

        values.append(tier_id)
        await db.execute(
            f"UPDATE reward_tiers SET {', '.join(fields)} WHERE id = ?",
            values
        )
        await db.commit()

    return {"success": True}


@router.delete("/tiers/{tier_id}")
async def deactivate_tier(tier_id: int, current_user: dict = Depends(get_current_parent)):
    """Soft deactivate a tier."""
    async with get_db() as db:
        await db.execute("UPDATE reward_tiers SET active = 0 WHERE id = ?", (tier_id,))
        await db.commit()
    return {"success": True}


# ============================================================================
# PARENT ENDPOINTS — REWARDS (CARGO ITEMS)
# ============================================================================

@router.get("/items")
async def get_reward_items(current_user: dict = Depends(get_current_parent)):
    """All reward items with tier info."""
    async with get_db() as db:
        async with db.execute(
            """
            SELECT r.*, rt.title as tier_title
            FROM rewards r
            LEFT JOIN reward_tiers rt ON r.tier_id = rt.id
            ORDER BY rt.display_order DESC, r.title
            """
        ) as cur:
            items = [dict(r) for r in await cur.fetchall()]
    return items


@router.post("/items")
async def create_reward_item(payload: dict, current_user: dict = Depends(get_current_parent)):
    """Create a new reward item."""
    title = payload.get("title", "").strip()
    tier_id = payload.get("tier_id")
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title required")
    if not tier_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="tier_id required")

    async with get_db() as db:
        async with db.execute("SELECT id FROM reward_tiers WHERE id = ?", (tier_id,)) as cur:
            if not await cur.fetchone():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tier not found")

        async with db.execute(
            """
            INSERT INTO rewards (tier_id, title, description, icon_path, quantity, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                tier_id,
                title,
                payload.get("description"),
                payload.get("icon_path"),
                payload.get("quantity"),  # None = unlimited
                current_user["id"]
            )
        ) as cur:
            reward_id = cur.lastrowid
        await db.commit()

    return {"id": reward_id, "message": "Cargo item created"}


@router.put("/items/{reward_id}")
async def update_reward_item(
    reward_id: int,
    payload: dict,
    current_user: dict = Depends(get_current_parent)
):
    """Update a reward item."""
    async with get_db() as db:
        async with db.execute("SELECT id FROM rewards WHERE id = ?", (reward_id,)) as cur:
            if not await cur.fetchone():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

        fields = []
        values = []
        for field in ("title", "description", "icon_path", "quantity", "tier_id", "active"):
            if field in payload:
                fields.append(f"{field} = ?")
                val = payload[field]
                # Allow explicitly setting quantity to None (unlimited)
                values.append(val)

        if not fields:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

        values.append(reward_id)
        await db.execute(
            f"UPDATE rewards SET {', '.join(fields)} WHERE id = ?",
            values
        )
        await db.commit()

    return {"success": True}


@router.delete("/items/{reward_id}")
async def deactivate_reward_item(reward_id: int, current_user: dict = Depends(get_current_parent)):
    """Soft deactivate a reward item."""
    async with get_db() as db:
        await db.execute("UPDATE rewards SET active = 0 WHERE id = ?", (reward_id,))
        await db.commit()
    return {"success": True}


# ============================================================================
# PARENT ENDPOINTS — REDEMPTIONS
# ============================================================================

@router.get("/redemptions")
async def get_redemptions(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_parent)
):
    """All redemptions (excluding pending_cargo) with optional status filter."""
    async with get_db() as db:
        query = """
            SELECT
                rr.*,
                r.title as reward_title, r.description as reward_description,
                r.icon_path as reward_icon_path,
                rt.title as tier_title, rt.cost as tier_cost,
                u.display_name as kid_name
            FROM reward_redemptions rr
            JOIN rewards r ON rr.reward_id = r.id
            JOIN reward_tiers rt ON rr.tier_id = rt.id
            JOIN users u ON rr.redeemed_by = u.id
            WHERE rr.status != 'pending_cargo'
        """
        params = []
        if status_filter:
            query += " AND rr.status = ?"
            params.append(status_filter)
        query += " ORDER BY rr.redeemed_at DESC, rr.awarded_at DESC"

        async with db.execute(query, params) as cur:
            rows = [dict(r) for r in await cur.fetchall()]

    return rows


@router.post("/redemptions/{redemption_id}/fulfill")
async def fulfill_redemption(
    redemption_id: int,
    current_user: dict = Depends(get_current_parent)
):
    """Mark a redeemed reward as fulfilled."""
    async with get_db() as db:
        async with db.execute(
            "SELECT * FROM reward_redemptions WHERE id = ?", (redemption_id,)
        ) as cur:
            row = await cur.fetchone()

        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
        if dict(row)["status"] != "redeemed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only redeemed rewards can be fulfilled"
            )

        await db.execute(
            """
            UPDATE reward_redemptions
            SET status = 'fulfilled', fulfilled_at = ?, fulfilled_by = ?
            WHERE id = ?
            """,
            (now_utc(), current_user["id"], redemption_id)
        )
        await db.commit()

    return {"success": True, "message": "Reward fulfilled"}


@router.post("/redemptions/{redemption_id}/return")
async def return_redemption(
    redemption_id: int,
    current_user: dict = Depends(get_current_parent)
):
    """Return a redeemed reward back to awarded (cargo hold)."""
    async with get_db() as db:
        async with db.execute(
            "SELECT * FROM reward_redemptions WHERE id = ?", (redemption_id,)
        ) as cur:
            row = await cur.fetchone()

        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
        if dict(row)["status"] != "redeemed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only redeemed rewards can be returned"
            )

        await db.execute(
            "UPDATE reward_redemptions SET status = 'awarded', redeemed_at = NULL WHERE id = ?",
            (redemption_id,)
        )
        await db.commit()

    return {"success": True, "message": "Reward returned to cargo hold"}


@router.post("/redemptions/{redemption_id}/cancel")
async def cancel_redemption(
    redemption_id: int,
    current_user: dict = Depends(get_current_parent)
):
    """
    Cancel a reward and refund points to kid.
    Works on awarded or redeemed status.
    Restores quantity if limited.
    """
    async with get_db() as db:
        async with db.execute(
            """
            SELECT rr.*, r.quantity as reward_quantity, r.id as r_id,
                   u.display_name as kid_name
            FROM reward_redemptions rr
            JOIN rewards r ON rr.reward_id = r.id
            JOIN users u ON rr.redeemed_by = u.id
            WHERE rr.id = ?
            """,
            (redemption_id,)
        ) as cur:
            row = await cur.fetchone()

        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

        r = dict(row)
        if r["status"] not in ("awarded", "redeemed"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only awarded or redeemed rewards can be cancelled"
            )

        # Refund points
        await db.execute(
            """
            INSERT INTO points_transactions (user_id, amount, transaction_type, description)
            VALUES (?, ?, 'adjustment', ?)
            """,
            (r["redeemed_by"], r["points_spent"], f"Reward cancelled: refund of {r['points_spent']} fuel")
        )

        # Restore quantity if limited
        if r["reward_quantity"] is not None:
            await db.execute(
                "UPDATE rewards SET quantity = quantity + 1 WHERE id = ?",
                (r["r_id"],)
            )

        # Delete redemption row
        await db.execute("DELETE FROM reward_redemptions WHERE id = ?", (redemption_id,))
        await db.commit()

    return {
        "success": True,
        "message": f"Reward cancelled and {r['points_spent']} fuel refunded to {r['kid_name']}"
    }
