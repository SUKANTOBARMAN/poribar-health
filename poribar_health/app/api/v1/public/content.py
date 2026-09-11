from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.config import settings
from app.models.content import Category, MediaFile
from app.schemas.content import CategoryOut

router = APIRouter(tags=["Content (Public)"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    """সব ক্যাটাগরি ফ্ল্যাট লিস্টে — frontend parent_id দিয়ে tree বানাবে"""
    return db.scalars(select(Category)).all()


@router.get("/media/{media_id}")
def serve_media(media_id: int, db: Session = Depends(get_db)):
    media = db.get(MediaFile, media_id)
    if not media:
        raise HTTPException(404, "ফাইল পাওয়া যায়নি")
    full_path = os.path.join(settings.UPLOAD_DIR, media.file_path)
    if not os.path.exists(full_path):
        raise HTTPException(404, "ফাইল পাওয়া যায়নি")
    return FileResponse(full_path)