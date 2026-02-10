"""Task expiration checker - locks expired task instances"""
from datetime import datetime, timezone
from typing import Optional, List


async def check_and_lock_expired_instances(
    db, 
    instance_ids: Optional[List[int]] = None
) -> int:
    """
    Lock expired incomplete task instances (lazy expiration).
    
    Only locks 'incomplete' status - pending tasks can still be reviewed after deadline.
    
    This function checks if incomplete tasks are past their available_end time and locks them.
    Can be called:
    1. Before returning task lists (kid/parent viewing)
    2. Before processing submissions (kid attempting to submit)
    3. Periodically via scheduler (safety net)
    
    Args:
        db: Database connection
        instance_ids: Optional list of specific instance IDs to check.
                     If None, checks all incomplete instances.
    
    Returns:
        Number of instances locked
    """
    now = datetime.now(timezone.utc).isoformat()
    
    if instance_ids:
        # Check specific instances
        placeholders = ','.join('?' * len(instance_ids))
        query = f"""
            UPDATE task_instances 
            SET status = 'locked'
            WHERE id IN ({placeholders})
            AND status = 'incomplete'
            AND available_end < ?
        """
        params = (*instance_ids, now)
    else:
        # Check all incomplete instances
        query = """
            UPDATE task_instances 
            SET status = 'locked'
            WHERE status = 'incomplete'
            AND available_end < ?
        """
        params = (now,)
    
    cursor = await db.execute(query, params)
    await db.commit()
    
    return cursor.rowcount


async def is_instance_expired(db, instance_id: int) -> bool:
    """
    Check if a specific task instance is expired.
    
    Args:
        db: Database connection
        instance_id: Task instance ID
    
    Returns:
        True if expired, False otherwise
    """
    now = datetime.now(timezone.utc).isoformat()
    
    async with db.execute(
        "SELECT available_end FROM task_instances WHERE id = ?",
        (instance_id,)
    ) as cursor:
        instance = await cursor.fetchone()
    
    if not instance:
        return False
    
    return instance['available_end'] < now
