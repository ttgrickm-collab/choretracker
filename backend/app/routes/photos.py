from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import FileResponse
import os
import shutil
from datetime import datetime
from typing import List
from app.auth import get_current_parent, get_current_kid, get_current_user
from app.database import get_db
from app.config import settings


router = APIRouter(prefix="/api", tags=["photos"])

ICONS_DIR = os.path.join(settings.UPLOAD_DIR, "icons")
PHOTOS_DIR = os.path.join(settings.UPLOAD_DIR, "task-photos")

# Ensure directories exist
os.makedirs(ICONS_DIR, exist_ok=True)
os.makedirs(PHOTOS_DIR, exist_ok=True)


# ============================================================================
# ICON ENDPOINTS
# ============================================================================

@router.post("/icons/upload")
async def upload_icon(
    icon: UploadFile = File(...),
    current_user: dict = Depends(get_current_parent)
):
    """Upload a custom task icon (parent only)"""
    # Validate file type
    if not icon.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Generate unique filename
    timestamp = int(datetime.now().timestamp())
    file_extension = os.path.splitext(icon.filename)[1]
    filename = f"custom_{timestamp}{file_extension}"
    file_path = os.path.join(ICONS_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(icon.file, buffer)
    
    return {
        "success": True,
        "icon_path": f"/api/icons/{filename}"
    }


@router.get("/icons")
async def list_icons(current_user: dict = Depends(get_current_parent)):
    """List all available task icons (parent only)"""
    if not os.path.exists(ICONS_DIR):
        return {"icons": []}
    
    icon_files = [
        f for f in os.listdir(ICONS_DIR)
        if os.path.isfile(os.path.join(ICONS_DIR, f))
        and f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))
    ]
    
    icons = [
        {
            "filename": f,
            "path": f"/api/icons/{f}",
            "created_at": os.path.getctime(os.path.join(ICONS_DIR, f))
        }
        for f in icon_files
    ]
    
    # Sort by creation time (newest first)
    icons.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {"icons": icons}


@router.get("/icons/{filename}")
async def get_icon(filename: str):
    """Serve an icon file (authenticated users only - parents and kids)"""
    file_path = os.path.join(ICONS_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Icon not found"
        )
    
    return FileResponse(file_path)


# ============================================================================
# PHOTO ENDPOINTS
# ============================================================================

@router.post("/photos/upload")
async def upload_photo(
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_kid)
):
    """Upload a task completion photo (kid only)"""
    # Validate file type
    if not photo.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Generate unique filename
    timestamp = int(datetime.now().timestamp())
    user_id = current_user["id"]
    file_extension = os.path.splitext(photo.filename)[1]
    filename = f"task_{user_id}_{timestamp}{file_extension}"
    file_path = os.path.join(PHOTOS_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    
    return {
        "success": True,
        "photo_path": f"/api/photos/{filename}"
    }


@router.get("/photos/{filename}")
async def get_photo(filename: str):
    """Serve a photo file (access controlled: assigned kid or any parent)"""
    file_path = os.path.join(PHOTOS_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Parents can access all photos
    if current_user["role"] == "parent":
        return FileResponse(file_path)
    
    # Kids can only access photos they submitted
    # Look up which task_instance this photo belongs to
    async with get_db() as db:
        async with db.execute(
            "SELECT assigned_to FROM task_instances WHERE photo_path = ?",
            (f"/api/photos/{filename}",)
        ) as cursor:
            instance = await cursor.fetchone()
    
    if not instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Check if this kid is the one assigned to the task
    if current_user["id"] != instance["assigned_to"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this photo"
        )
    
    return FileResponse(file_path)
