from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    icon_path: Optional[str] = None
    points_value: int = Field(..., gt=0)
    task_type: str = Field(..., pattern="^(recurring|custom)$")
    recurrence_pattern: Optional[str] = Field(None, pattern="^(daily|weekly|custom)$")
    recurrence_days: Optional[List[int]] = None
    photo_required: bool = True
    photo_criteria: Optional[str] = None
    available_start_offset: int = Field(360, ge=0, le=1440)
    duration: int = Field(2340, ge=1, le=10080)
    assigned_to: Optional[int] = None


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
    available_start_offset: Optional[int] = Field(None, ge=0, le=1440)
    duration: Optional[int] = Field(None, ge=1, le=10080)
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
