from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import FileResponse
import os
import shutil
from datetime import datetime
from app.auth import get_current_parent
from app.config import settings


router = APIRouter(prefix="/api", tags=["photos"])

ICONS_DIR = os.path.join(settings.UPLOAD_DIR, "icons")
PHOTOS_DIR = os.path.join(settings.UPLOAD_DIR, "task-photos")

# Ensure directories exist
os.makedirs(ICONS_DIR, exist_ok=True)
os.makedirs(PHOTOS_DIR, exist_ok=True)


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
        "icon_path": f"/images/icons/{filename}"
    }


@router.get("/photos/{filename}")
async def get_photo(filename: str):
    """Serve a photo file"""
    file_path = os.path.join(PHOTOS_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    return FileResponse(file_path)


@router.get("/icons/{filename}")
async def get_icon(filename: str):
    """Serve an icon file"""
    file_path = os.path.join(ICONS_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Icon not found"
        )
    
    return FileResponse(file_path)
