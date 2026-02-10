from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import json
from datetime import datetime, timedelta, timezone
from app.models.task import TaskCreate, TaskUpdate, TaskResponse
from app.auth import get_current_parent
from app.database import get_db


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    custom_start_datetime: Optional[str] = None,
    custom_end_datetime: Optional[str] = None,
    current_user: dict = Depends(get_current_parent)
):
    """Create a new task (parent only)"""
    recurrence_days_json = json.dumps(task.recurrence_days) if task.recurrence_days else None
    
    async with get_db() as db:
        columns = [
            "title", "description", "icon_path", "points_value", "task_type",
            "recurrence_pattern", "recurrence_days", "photo_required",
            "photo_criteria", "available_start_offset", "duration", "created_by", "active"
        ]
        
        values = [
            task.title,
            task.description,
            task.icon_path,
            task.points_value,
            task.task_type,
            task.recurrence_pattern,
            recurrence_days_json,
            task.photo_required,
            task.photo_criteria,
            task.available_start_offset,
            task.duration,
            current_user["id"],
            1
        ]
        
        if task.assigned_to is not None:
            columns.append("assigned_to")
            values.append(task.assigned_to)
        
        placeholders = ", ".join(["?"] * len(values))
        columns_str = ", ".join(columns)
        
        cursor = await db.execute(
            f"INSERT INTO tasks ({columns_str}) VALUES ({placeholders})",
            tuple(values)
        )
        await db.commit()
        task_id = cursor.lastrowid
        
        if task.task_type == 'custom':
            async with db.execute("SELECT id FROM users WHERE role = 'kid'") as cursor:
                kids = await cursor.fetchall()
            
            assigned_kids = [task.assigned_to] if task.assigned_to is not None else [k['id'] for k in kids]
            
            if custom_start_datetime and custom_end_datetime:
                available_start = custom_start_datetime
                available_end = custom_end_datetime
            else:
                now = datetime.now(timezone.utc)
                today_midnight = datetime.combine(now.date(), datetime.min.time()).replace(tzinfo=timezone.utc)
                available_start = (today_midnight + timedelta(minutes=task.available_start_offset)).isoformat()
                available_end = (today_midnight + timedelta(minutes=task.available_start_offset + task.duration)).isoformat()
            
            for kid_id in assigned_kids:
                await db.execute(
                    """
                    INSERT INTO task_instances (
                        task_id, assigned_to, available_start, available_end, status
                    ) VALUES (?, ?, ?, ?, 'incomplete')
                    """,
                    (task_id, kid_id, available_start, available_end)
                )
            
            await db.commit()
        
        async with db.execute(
            "SELECT * FROM tasks WHERE id = ?",
            (task_id,)
        ) as cursor:
            task_row = await cursor.fetchone()
    
    task_dict = dict(task_row)
    if task_dict["recurrence_days"]:
        task_dict["recurrence_days"] = json.loads(task_dict["recurrence_days"])
    
    return TaskResponse(**task_dict)


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    active: bool = True,
    current_user: dict = Depends(get_current_parent)
):
    """Get all tasks (parent only)"""
    async with get_db() as db:
        query = "SELECT * FROM tasks WHERE active = ?" if active else "SELECT * FROM tasks"
        params = (1,) if active else ()
        
        async with db.execute(query, params) as cursor:
            tasks = await cursor.fetchall()
    
    tasks_list = []
    for task_row in tasks:
        task_dict = dict(task_row)
        if task_dict["recurrence_days"]:
            task_dict["recurrence_days"] = json.loads(task_dict["recurrence_days"])
        tasks_list.append(TaskResponse(**task_dict))
    
    return tasks_list


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: dict = Depends(get_current_parent)
):
    """Get a single task by ID (parent only)"""
    async with get_db() as db:
        async with db.execute(
            "SELECT * FROM tasks WHERE id = ?",
            (task_id,)
        ) as cursor:
            task_row = await cursor.fetchone()
    
    if not task_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task_dict = dict(task_row)
    if task_dict["recurrence_days"]:
        task_dict["recurrence_days"] = json.loads(task_dict["recurrence_days"])
    
    return TaskResponse(**task_dict)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: dict = Depends(get_current_parent)
):
    """Update a task (parent only)"""
    update_fields = []
    update_values = []
    
    update_data = task_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "recurrence_days" and value is not None:
            value = json.dumps(value)
        
        if field == "assigned_to":
            if value is None:
                update_fields.append(f"{field} = NULL")
                continue
        
        update_fields.append(f"{field} = ?")
        update_values.append(value)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_values.append(task_id)
    
    async with get_db() as db:
        await db.execute(
            f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = ?",
            tuple(update_values)
        )
        await db.commit()
        
        async with db.execute(
            "SELECT * FROM tasks WHERE id = ?",
            (task_id,)
        ) as cursor:
            task_row = await cursor.fetchone()
    
    if not task_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task_dict = dict(task_row)
    if task_dict["recurrence_days"]:
        task_dict["recurrence_days"] = json.loads(task_dict["recurrence_days"])
    
    return TaskResponse(**task_dict)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: dict = Depends(get_current_parent)
):
    """Soft delete a task (parent only)"""
    async with get_db() as db:
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
        
        await db.execute(
            "UPDATE tasks SET active = 0 WHERE id = ?",
            (task_id,)
        )
        await db.commit()
