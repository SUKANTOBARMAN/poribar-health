from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user
from app.core.security import hash_password, verify_password
from app.database import get_db
from app.models.user import User
from app.schemas.auth import PasswordChangeRequest, ProfileUpdate, UserOut

router = APIRouter(prefix="/auth", tags=["Profile Settings"])


@router.patch("/me", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """নিজের নাম/ইমেইল আপডেট — যেকোনো role-এর ইউজার ব্যবহার করতে পারবে।"""
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserOut(
        id=current_user.id, name=current_user.name, phone=current_user.phone,
        email=current_user.email, status=current_user.status.value,
        roles=[r.name for r in current_user.roles],
    )


@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """পাসওয়ার্ড বদলানো — আগের পাসওয়ার্ড যাচাই করে তবেই নতুনটা সেভ হবে।"""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(400, "বর্তমান পাসওয়ার্ড ভুল")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"status": "ok"}