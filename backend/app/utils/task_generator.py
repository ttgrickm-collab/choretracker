"""Task instance generator - creates instances from task templates"""
import json
from datetime import datetime, timedelta, timezone
from typing import Optional


async def generate_tasks_for_day(db, days_ahead: int = 7) -> int:
    """
    Generate task instances for a specific day in the future.
    
    Args:
        db: Database connection
        days_ahead: Number of days in the future (0 = today, 7 = week from now)
    
    Returns:
        Number of task instances created
    """
    target_date = (datetime.now(timezone.utc) + timedelta(days=days_ahead)).date()
    target_weekday = target_date.weekday()
    
    async with db.execute(
        "SELECT * FROM tasks WHERE active = 1 AND task_type = 'recurring'"
    ) as cursor:
        tasks = await cursor.fetchall()
    
    async with db.execute(
        "SELECT id FROM users WHERE role = 'kid'"
    ) as cursor:
        kids = await cursor.fetchall()
    
    kid_ids = [kid['id'] for kid in kids]
    
    if not kid_ids:
        print("⚠ No kid users found - no instances generated")
        return 0
    
    instances_created = 0
    
    for task in tasks:
        task_dict = dict(task)
        should_generate = False
        
        if task_dict['recurrence_pattern'] == 'daily':
            should_generate = True
        elif task_dict['recurrence_pattern'] == 'weekly':
            recurrence_days = json.loads(task_dict['recurrence_days']) if task_dict['recurrence_days'] else []
            should_generate = target_weekday in recurrence_days
        
        if not should_generate:
            continue
        
        assigned_kids = [task_dict['assigned_to']] if task_dict['assigned_to'] is not None else kid_ids
        
        for kid_id in assigned_kids:
            async with db.execute(
                """
                SELECT id FROM task_instances 
                WHERE task_id = ? AND assigned_to = ? 
                AND date(available_start) = ?
                """,
                (task_dict['id'], kid_id, target_date.isoformat())
            ) as cursor:
                existing = await cursor.fetchone()
            
            if existing:
                continue
            
            midnight = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=timezone.utc)
            available_start = midnight + timedelta(minutes=task_dict['available_start_offset'])
            available_end = available_start + timedelta(minutes=task_dict['duration'])
            
            await db.execute(
                """
                INSERT INTO task_instances (
                    task_id, assigned_to, available_start, available_end, status
                ) VALUES (?, ?, ?, ?, 'incomplete')
                """,
                (task_dict['id'], kid_id, available_start.isoformat(), available_end.isoformat())
            )
            instances_created += 1
    
    await db.commit()
    return instances_created


async def bootstrap_initial_week(db) -> int:
    """
    Bootstrap the first 7 days of task instances (Days 0-6).
    Run this once on initial setup.
    
    Returns:
        Total number of instances created
    """
    print("🚀 Bootstrapping initial 7-day task window...")
    total_created = 0
    
    for day in range(7):
        count = await generate_tasks_for_day(db, days_ahead=day)
        total_created += count
        print(f"  Day +{day}: Created {count} instances")
    
    print(f"✓ Bootstrap complete! Created {total_created} total instances")
    return total_created


if __name__ == "__main__":
    """
    Run this file directly to bootstrap initial tasks:
    python -m app.utils.task_generator bootstrap
    """
    import sys
    import asyncio
    from app.database import get_db
    
    async def run_bootstrap():
        async with get_db() as db:
            await bootstrap_initial_week(db)
    
    if len(sys.argv) > 1 and sys.argv[1] == "bootstrap":
        asyncio.run(run_bootstrap())
    else:
        print("Usage: python -m app.utils.task_generator bootstrap")
