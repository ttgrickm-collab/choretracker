"""Task instance routes - kid submission and parent review"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Optional
from datetime import datetime, timezone
import os
from pydantic import BaseModel

from app.models.task import TaskInstanceResponse
from app.auth import get_current_kid, get_current_parent, get_current_user
from app.database import get_db
from app.utils.task_expiration import check_and_lock_expired_instances, is_instance_expired
from app.config import settings


router = APIRouter(prefix="/api/task-instances", tags=["task-instances"])


# ============================================================================
# REQUEST MODELS
# ============================================================================

class TaskSubmissionRequest(BaseModel):
    photo_path: str

class TaskRejectionRequest(BaseModel):
    rejection_reason: str


# ============================================================================
# KID ENDPOINTS
# ============================================================================

@router.get("/my-tasks", response_model=List[dict])
async def get_my_tasks(
    current_user: dict = Depends(get_current_kid)
):
    """
    Get all task instances for the current kid from active tasks.
    Returns all statuses - frontend can filter as needed.
    """
    async with get_db() as db:
        # Lazy expiration check - locks expired incomplete tasks
        await check_and_lock_expired_instances(db)
        
        # Fetch kid's tasks with task details joined, filter to active tasks only
        async with db.execute(
            """
            SELECT 
                ti.*,
                t.title, t.description, t.icon_path, t.points_value,
                t.photo_required, t.photo_criteria
            FROM task_instances ti
            JOIN tasks t ON ti.task_id = t.id
            WHERE ti.assigned_to = ?
            AND t.active = 1
            ORDER BY ti.available_start ASC
            """,
            (current_user['id'],)
        ) as cursor:
            tasks = await cursor.fetchall()
    
    return [dict(task) for task in tasks]


@router.post("/{instance_id}/submit", response_model=dict)
async def submit_task(
    instance_id: int,
    submission: TaskSubmissionRequest,
    current_user: dict = Depends(get_current_kid)
):
    """
    Submit a task instance with photo proof.
    Changes status from 'incomplete' to 'pending'.
    """
    async with get_db() as db:
        # Check expiration before allowing submission
        await check_and_lock_expired_instances(db, [instance_id])
        
        # Fetch the instance
        async with db.execute(
            "SELECT * FROM task_instances WHERE id = ?",
            (instance_id,)
        ) as cursor:
            instance = await cursor.fetchone()
        
        if not instance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task instance not found"
            )
        
        instance_dict = dict(instance)
        
        # Verify ownership
        if instance_dict['assigned_to'] != current_user['id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This task is not assigned to you"
            )
        
        # Check status
        if instance_dict['status'] == 'locked':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This task has expired and can no longer be submitted"
            )
        
        if instance_dict['status'] not in ('incomplete', 'pending'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot submit task in '{instance_dict['status']}' status"
            )
        
        # Update instance with photo and pending status
        now = datetime.now(timezone.utc).isoformat()
        await db.execute(
            """
            UPDATE task_instances 
            SET status = 'pending', 
                photo_path = ?,
                submitted_at = ?
            WHERE id = ?
            """,
            (submission.photo_path, now, instance_id)
        )
        
        # Record in task history
        await db.execute(
            """
            INSERT INTO task_history (task_instance_id, status_change, changed_by, notes)
            VALUES (?, ?, ?, ?)
            """,
            (instance_id, 'incomplete -> pending', current_user['id'], 'Photo submitted')
        )
        
        await db.commit()
    
    return {
        "success": True,
        "message": "Task submitted successfully! Waiting for parent approval."
    }


# ============================================================================
# PARENT ENDPOINTS
# ============================================================================

@router.get("/pending", response_model=List[dict])
async def get_pending_tasks(
    current_user: dict = Depends(get_current_parent)
):
    """
    Get all pending task submissions across all kids.
    Includes task details, kid info, and submission photo.
    """
    async with get_db() as db:
        # Lazy expiration check
        await check_and_lock_expired_instances(db)
        
        async with db.execute(
            """
            SELECT 
                ti.*,
                t.title, t.description, t.icon_path, t.points_value,
                t.photo_required, t.photo_criteria,
                u.display_name as kid_name
            FROM task_instances ti
            JOIN tasks t ON ti.task_id = t.id
            JOIN users u ON ti.assigned_to = u.id
            WHERE ti.status = 'pending'
            ORDER BY ti.submitted_at ASC
            """,
        ) as cursor:
            pending = await cursor.fetchall()
    
    return [dict(task) for task in pending]


@router.get("/all", response_model=List[dict])
async def get_all_instances(
    kid_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_parent)
):
    """
    Get all task instances with optional filters.
    Parent only - for admin/history views.
    """
    async with get_db() as db:
        # Build dynamic query
        query = """
            SELECT 
                ti.*,
                t.title, t.description, t.icon_path, t.points_value,
                u.display_name as kid_name
            FROM task_instances ti
            JOIN tasks t ON ti.task_id = t.id
            JOIN users u ON ti.assigned_to = u.id
            WHERE 1=1
        """
        params = []
        
        if kid_id:
            query += " AND ti.assigned_to = ?"
            params.append(kid_id)
        
        if status_filter:
            query += " AND ti.status = ?"
            params.append(status_filter)
        
        query += " ORDER BY ti.available_start DESC"
        
        async with db.execute(query, params) as cursor:
            instances = await cursor.fetchall()
    
    return [dict(instance) for instance in instances]


@router.post("/{instance_id}/approve", response_model=dict)
async def approve_task(
    instance_id: int,
    current_user: dict = Depends(get_current_parent)
):
    """
    Approve a pending task submission.
    Awards points, deletes photo, changes status to 'approved'.
    """
    async with get_db() as db:
        # Fetch the instance
        async with db.execute(
            """
            SELECT ti.*, t.points_value, t.title
            FROM task_instances ti
            JOIN tasks t ON ti.task_id = t.id
            WHERE ti.id = ?
            """,
            (instance_id,)
        ) as cursor:
            instance = await cursor.fetchone()
        
        if not instance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task instance not found"
            )
        
        instance_dict = dict(instance)
        
        if instance_dict['status'] != 'pending':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve task in '{instance_dict['status']}' status"
            )
        
        now = datetime.now(timezone.utc).isoformat()
        
        # Award points via transaction
        await db.execute(
            """
            INSERT INTO points_transactions (user_id, amount, transaction_type, reference_id, description)
            VALUES (?, ?, 'task_completion', ?, ?)
            """,
            (
                instance_dict['assigned_to'],
                instance_dict['points_value'],
                instance_id,
                f"Completed: {instance_dict['title']}"
            )
        )
        
        # Update instance
        await db.execute(
            """
            UPDATE task_instances 
            SET status = 'approved',
                reviewed_by = ?,
                reviewed_at = ?,
                points_awarded = ?
            WHERE id = ?
            """,
            (current_user['id'], now, instance_dict['points_value'], instance_id)
        )
        
        # Record in history
        await db.execute(
            """
            INSERT INTO task_history (task_instance_id, status_change, changed_by, notes)
            VALUES (?, ?, ?, ?)
            """,
            (instance_id, 'pending -> approved', current_user['id'], f"Awarded {instance_dict['points_value']} points")
        )
        
        await db.commit()
        
        # Delete photo to save space
        if instance_dict['photo_path']:
            photo_filename = instance_dict['photo_path'].split('/')[-1]
            photo_full_path = os.path.join(settings.UPLOAD_DIR, "task-photos", photo_filename)
            if os.path.exists(photo_full_path):
                os.remove(photo_full_path)
    
    return {
        "success": True,
        "message": f"Task approved! {instance_dict['points_value']} points awarded.",
        "points_awarded": instance_dict['points_value']
    }


@router.post("/{instance_id}/reject", response_model=dict)
async def reject_task(
    instance_id: int,
    rejection: TaskRejectionRequest,
    current_user: dict = Depends(get_current_parent)
):
    """
    Reject a pending task submission.
    
    Smart status logic:
    - If still within available_end: status -> 'incomplete' (kid can resubmit, delete photo)
    - If past available_end: status -> 'rejected' (task failed, keep photo)
    """
    async with get_db() as db:
        # Fetch the instance
        async with db.execute(
            "SELECT * FROM task_instances WHERE id = ?",
            (instance_id,)
        ) as cursor:
            instance = await cursor.fetchone()
        
        if not instance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task instance not found"
            )
        
        instance_dict = dict(instance)
        
        if instance_dict['status'] != 'pending':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reject task in '{instance_dict['status']}' status"
            )
        
        # Determine new status based on expiration
        is_expired = await is_instance_expired(db, instance_id)
        new_status = 'rejected' if is_expired else 'incomplete'
        
        now = datetime.now(timezone.utc).isoformat()
        
        # Update instance
        await db.execute(
            """
            UPDATE task_instances 
            SET status = ?,
                reviewed_by = ?,
                reviewed_at = ?,
                rejection_reason = ?
            WHERE id = ?
            """,
            (new_status, current_user['id'], now, rejection.rejection_reason, instance_id)
        )
        
        # Record in history
        await db.execute(
            """
            INSERT INTO task_history (task_instance_id, status_change, changed_by, notes)
            VALUES (?, ?, ?, ?)
            """,
            (instance_id, f'pending -> {new_status}', current_user['id'], f"Rejected: {rejection.rejection_reason}")
        )
        
        await db.commit()
        
        # If kid can resubmit, delete photo so they can upload a new one
        if new_status == 'incomplete' and instance_dict['photo_path']:
            photo_filename = instance_dict['photo_path'].split('/')[-1]
            photo_full_path = os.path.join(settings.UPLOAD_DIR, "task-photos", photo_filename)
            if os.path.exists(photo_full_path):
                os.remove(photo_full_path)
    
    return {
        "success": True,
        "new_status": new_status,
        "message": "Task rejected. " + (
            "Kid can resubmit before deadline." if new_status == 'incomplete' 
            else "Task has expired - marked as rejected."
        )
    }


@router.post("/create-custom", response_model=dict)
async def create_custom_instance(
    task_id: int,
    assigned_to: int,
    available_start: str,
    available_end: str,
    current_user: dict = Depends(get_current_parent)
):
    """
    Create a one-time custom task instance.
    Parent only - for assigning tasks outside recurring schedule.
    """
    async with get_db() as db:
        # Verify task exists
        async with db.execute(
            "SELECT id FROM tasks WHERE id = ?",
            (task_id,)
        ) as cursor:
            task = await cursor.fetchone()
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        # Verify kid exists
        async with db.execute(
            "SELECT id FROM users WHERE id = ? AND role = 'kid'",
            (assigned_to,)
        ) as cursor:
            kid = await cursor.fetchone()
        
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kid not found"
            )
        
        # Create instance
        await db.execute(
            """
            INSERT INTO task_instances (
                task_id, assigned_to, available_start, available_end, status
            ) VALUES (?, ?, ?, ?, 'incomplete')
            """,
            (task_id, assigned_to, available_start, available_end)
        )
        
        await db.commit()
    
    return {
        "success": True,
        "message": "Custom task instance created successfully"
    }


@router.delete("/{instance_id}")
async def delete_instance(
    instance_id: int,
    current_user: dict = Depends(get_current_parent)
):
    """
    Delete a task instance (parent only).
    Used for cleanup or removing incorrectly generated tasks.
    """
    async with get_db() as db:
        # Fetch the instance
        async with db.execute(
            "SELECT * FROM task_instances WHERE id = ?",
            (instance_id,)
        ) as cursor:
            instance = await cursor.fetchone()
        
        if not instance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task instance not found"
            )
        
        instance_dict = dict(instance)
        
        # Delete the instance
        await db.execute(
            "DELETE FROM task_instances WHERE id = ?",
            (instance_id,)
        )
        await db.commit()
        
        # Delete photo if exists
        if instance_dict['photo_path']:
            photo_filename = instance_dict['photo_path'].split('/')[-1]
            photo_full_path = os.path.join(settings.UPLOAD_DIR, "task-photos", photo_filename)
            if os.path.exists(photo_full_path):
                os.remove(photo_full_path)
    
    return None
