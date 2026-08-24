from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.database import get_db
from app.models.user import User
from app.config import settings
import os

router = APIRouter(
    prefix="/director/volunteers",
    tags=["Volunteer Documents (Director)"],
    dependencies=[Depends(require_role("director", "super_admin"))],
)


@router.get("/{user_id}/document")
def view_volunteer_document(user_id: int, db: Session = Depends(get_db)):
    """ভলান্টিয়ারের আপলোড করা ডকুমেন্ট verification-এর জন্য দেখা"""
    user = db.get(User, user_id)
    if not user or not user.volunteer_profile or not user.volunteer_profile.student_id_doc:
        raise HTTPException(404, "কোনো ডকুমেন্ট পাওয়া যায়নি")

    full_path = os.path.join(settings.UPLOAD_DIR, user.volunteer_profile.student_id_doc)
    if not os.path.exists(full_path):
        raise HTTPException(404, "ফাইল পাওয়া যায়নি")
    return FileResponse(full_path)