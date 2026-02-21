import sqlite3
import aiosqlite
from contextlib import asynccontextmanager
from app.config import settings
import os


DATABASE_PATH = settings.DATABASE_URL


def init_database():
    """Initialize database with schema - run once on startup"""
    db_dir = os.path.dirname(DATABASE_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('parent', 'kid')),
            display_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            icon_path TEXT,
            points_value INTEGER NOT NULL,
            task_type TEXT NOT NULL CHECK(task_type IN ('recurring', 'custom')),
            recurrence_pattern TEXT CHECK(recurrence_pattern IN ('daily', 'weekly', 'custom')),
            recurrence_days TEXT,
            photo_required INTEGER DEFAULT 1,
            photo_criteria TEXT,
            available_start_offset INTEGER DEFAULT 360,
            duration INTEGER DEFAULT 2340,
            created_by INTEGER NOT NULL,
            assigned_to INTEGER,
            active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (assigned_to) REFERENCES users(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS task_instances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            assigned_to INTEGER NOT NULL,
            available_start TIMESTAMP NOT NULL,
            available_end TIMESTAMP NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('incomplete', 'pending', 'approved', 'completed', 'rejected', 'locked')),
            submitted_at TIMESTAMP,
            photo_path TEXT,
            reviewed_by INTEGER,
            reviewed_at TIMESTAMP,
            rejection_reason TEXT,
            points_awarded INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id),
            FOREIGN KEY (assigned_to) REFERENCES users(id),
            FOREIGN KEY (reviewed_by) REFERENCES users(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS points_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            amount INTEGER NOT NULL,
            transaction_type TEXT NOT NULL CHECK(transaction_type IN ('task_completion', 'shop_purchase', 'bonus', 'adjustment')),
            reference_id INTEGER,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS task_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_instance_id INTEGER NOT NULL,
            status_change TEXT NOT NULL,
            changed_by INTEGER NOT NULL,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (task_instance_id) REFERENCES task_instances(id),
            FOREIGN KEY (changed_by) REFERENCES users(id)
        )
    """)
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE username = 'parent'")
    if cursor.fetchone()[0] == 0:
        conn.commit()
        conn.close()
        
        from app.utils.user import User
        parent = User(username='parent', role='parent', display_name='Parent')
        parent.password = 'password123'
        parent.save()
        
        print("✓ Created default parent user (username: parent, password: password123)")
        return
    
    conn.commit()
    conn.close()
    print("✓ Database initialized successfully")


@asynccontextmanager
async def get_db():
    """Async context manager for database connections"""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db
