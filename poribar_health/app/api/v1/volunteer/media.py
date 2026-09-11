from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.content import MediaFile
from app.models.user import User
from app.schemas.content import MediaFileOut
from app.services.file_service import validate_and_save_upload

router = APIRouter(
    prefix="/volunteer/media",
    tags=["Media Upload"],
    # আগে শুধু "volunteer" ছিল — director/super_admin-ও এখন article edit করতে পারে,
    # তাদেরও ছবি আপলোড করতে হবে, তাই role list বড় করা হলো
    dependencies=[Depends(require_role("volunteer", "director", "super_admin"))],
)


@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    relative_path = await validate_and_save_upload(file, subfolder="media")
    media = MediaFile(uploaded_by=current_user.id, file_path=relative_path, content_type=file.content_type)
    db.add(media)
    db.commit()
    db.refresh(media)
    return {"id": media.id, "url": f"/api/v1/media/{media.id}"}


@router.get("", response_model=list[MediaFileOut])
def list_my_media(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(MediaFile).where(MediaFile.uploaded_by == current_user.id).order_by(MediaFile.created_at.desc())
    return db.scalars(stmt).all()