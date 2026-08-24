from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.database import get_db
from app.models.emergency import Ambulance
from app.schemas.emergency import AmbulanceOut

router = APIRouter(
    prefix="/ambulances",
    tags=["Ambulances (Volunteer)"],
    dependencies=[Depends(require_role("volunteer", "director", "super_admin"))],
)


@router.post("/{ambulance_id}/toggle-availability", response_model=AmbulanceOut)
def toggle_availability(ambulance_id: int, db: Session = Depends(get_db)):
    """অ্যাম্বুলেন্স availability আপডেট — doc: POST /ambulances/{id}/toggle-availability"""
    ambulance = db.scalar(select(Ambulance).where(Ambulance.id == ambulance_id))
    if not ambulance:
        raise HTTPException(404, "অ্যাম্বুলেন্স পাওয়া যায়নি")

    ambulance.availability_status = not ambulance.availability_status
    db.commit()
    db.refresh(ambulance)
    return ambulance