from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    icon_path: Optional[str] = None
    points_value: int = Field(..., gt=0)
    task_type: str = Field(..., pattern="^(recurring|one-off)$")
    recurrence_pattern: Optional[str] = Field(None, pattern="^(daily|weekly|one-off)$")
    recurrence_days: Optional[List[int]] = None  # [0-6] for days of week
    photo_required: bool = True
    photo_criteria: Optional[str] = None
    assigned_to: Optional[int] = None  # None means all kids


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    icon_path: Optional[str] = None
    points_value: Optional[int] = Field(None, gt=0)
    recurrence_pattern: Optional[str] = None
    recurrence_days: Optional[List[int]] = None
    photo_required: Optional[bool] = None
    photo_criteria: Optional[str] = None
    assigned_to: Optional[int] = None
    active: Optional[bool] = None


class TaskResponse(TaskBase):
    id: int
    created_by: int
    active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class TaskInstanceResponse(BaseModel):
    id: int
    task_id: int
    assigned_to: int
    available_start: datetime
    available_end: datetime
    status: str
    submitted_at: Optional[datetime] = None
    photo_path: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    points_awarded: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
