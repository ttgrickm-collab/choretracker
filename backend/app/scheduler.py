"""APScheduler integration for automated task generation and expiration checking"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timezone
import asyncio

from app.config import settings
from app.utils.task_generator import generate_tasks_for_day
from app.utils.task_expiration import check_and_lock_expired_instances
from app.database import get_db


scheduler = AsyncIOScheduler()


async def daily_task_generation_job():
    """
    Runs daily at midnight.
    Generates task instances for Day +7 (7 days from now).
    """
    try:
        print(f"[{datetime.now(timezone.utc)}] Running daily task generation (Day +7)...")
        async with get_db() as db:
            count = await generate_tasks_for_day(db, days_ahead=7)
        print(f"✓ Generated {count} task instances for Day +7")
    except Exception as e:
        print(f"✗ Error in daily task generation: {e}")


async def expiration_check_job():
    """
    Runs every 10 minutes.
    Safety net to lock any expired tasks that weren't caught by lazy checking.
    """
    try:
        async with get_db() as db:
            locked_count = await check_and_lock_expired_instances(db)
        if locked_count > 0:
            print(f"[{datetime.now(timezone.utc)}] Locked {locked_count} expired task instances")
    except Exception as e:
        print(f"✗ Error in expiration check: {e}")


def start_scheduler():
    """Initialize and start the scheduler"""
    print("🕐 Starting APScheduler...")
    
    # Daily task generation at midnight
    scheduler.add_job(
        daily_task_generation_job,
        trigger=CronTrigger(hour=0, minute=0),
        id='daily_task_generation',
        name='Generate tasks for Day +7',
        replace_existing=True
    )
    
    # Expiration checker every 10 minutes
    scheduler.add_job(
        expiration_check_job,
        trigger=CronTrigger(minute='*/10'),
        id='expiration_check',
        name='Lock expired task instances',
        replace_existing=True
    )
    
    scheduler.start()
    print("✓ APScheduler started successfully")


def shutdown_scheduler():
    """Gracefully shut down the scheduler"""
    if scheduler.running:
        print("👋 Shutting down APScheduler...")
        scheduler.shutdown()
        print("✓ APScheduler stopped")
