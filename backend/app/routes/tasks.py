from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import json
from app.models.task import TaskCreate, TaskUpdate, TaskResponse
from app.auth import get_current_parent
from app.database import get_db


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: dict = Depends(get_current_parent)
):
    """Create a new task (parent only)"""
    # Convert recurrence_days list to JSON string for storage
    recurrence_days_json = json.dumps(task.recurrence_days) if task.recurrence_days else None
    
    async with get_db() as db:
        cursor = await db.execute(
            """
            INSERT INTO tasks (
                title, description, icon_path, points_value, task_type,
                recurrence_pattern, recurrence_days, photo_required,
                photo_criteria, created_by, assigned_to, active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """,
            (
                task.title,
                task.description,
                task.icon_path,
                task.points_value,
                task.task_type,
                task.recurrence_pattern,
                recurrence_days_json,
                task.photo_required,
                task.photo_criteria,
                current_user["id"],
                task.assigned_to
            )
        )
        await db.commit()
        task_id = cursor.lastrowid
        
        # Fetch the created task
        async with db.execute(
            "SELECT * FROM tasks WHERE id = ?",
            (task_id,)
        ) as cursor:
            task_row = await cursor.fetchone()
    
    task_dict = dict(task_row)
    # Parse recurrence_days back to list
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
        # Parse recurrence_days back to list
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
    # Build dynamic update query
    update_fields = []
    update_values = []
    
    update_data = task_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "recurrence_days" and value is not None:
            value = json.dumps(value)
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
        
        # Fetch updated task
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
        await db.execute(
            "UPDATE tasks SET active = 0 WHERE id = ?",
            (task_id,)
        )
        await db.commit()
    
    return None
