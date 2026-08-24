from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user
from app.database import get_db
from app.models.emergency import BloodDonor
from app.models.user import User
from app.schemas.emergency import BloodDonorOut, BloodDonorRegister

router = APIRouter(prefix="/blood-donors", tags=["Blood Donors (User)"])


@router.post("/register", response_model=BloodDonorOut, status_code=201)
def register_blood_donor(
    payload: BloodDonorRegister,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """রক্তদাতা হিসেবে নিবন্ধন — doc: POST /blood-donors/register"""
    existing = db.scalar(select(BloodDonor).where(BloodDonor.user_id == current_user.id))
    if existing:
        raise HTTPException(400, "তুমি ইতিমধ্যে রক্তদাতা হিসেবে নিবন্ধিত")

    donor = BloodDonor(
        user_id=current_user.id,
        blood_group=payload.blood_group,
        upazila_id=payload.upazila_id,
        last_donated_at=payload.last_donated_at,
        contact_visibility=payload.contact_visibility,
        is_available=True,
    )
    db.add(donor)
    db.commit()
    db.refresh(donor)
    return donor