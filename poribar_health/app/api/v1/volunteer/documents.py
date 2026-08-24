from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.user import User
from app.services.file_service import validate_and_save_upload
from app.config import settings
import os

router = APIRouter(
    prefix="/volunteer/profile",
    tags=["Volunteer Documents"],
    dependencies=[Depends(require_role("volunteer"))],
)


@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """স্টুডেন্ট আইডি কার্ড আপলোড — doc: student_id_doc [file path]"""
    profile = current_user.volunteer_profile
    if not profile:
        raise HTTPException(404, "ভলান্টিয়ার প্রোফাইল পাওয়া যায়নি")

    relative_path = await validate_and_save_upload(file, subfolder="volunteer_docs")
    profile.student_id_doc = relative_path
    db.commit()
    return {"status": "uploaded", "path": relative_path}


@router.get("/document")
def download_own_document(current_user: User = Depends(get_current_user)):
    """নিজের আপলোড করা ডকুমেন্ট ডাউনলোড"""
    profile = current_user.volunteer_profile
    if not profile or not profile.student_id_doc:
        raise HTTPException(404, "কোনো ডকুমেন্ট আপলোড করা হয়নি")

    full_path = os.path.join(settings.UPLOAD_DIR, profile.student_id_doc)
    if not os.path.exists(full_path):
        raise HTTPException(404, "ফাইল পাওয়া যায়নি")
    return FileResponse(full_path)