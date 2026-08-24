from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.database import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalCreate, HospitalListOut, HospitalUpdate

router = APIRouter(
    prefix="/admin/hospitals",
    tags=["Hospitals (Admin)"],
    dependencies=[Depends(require_role("super_admin"))],
)


@router.post("", response_model=HospitalListOut, status_code=status.HTTP_201_CREATED)
def create_hospital(payload: HospitalCreate, db: Session = Depends(get_db)):
    """হাসপাতাল যোগ — doc: POST /admin/hospitals"""
    hospital = Hospital(**payload.model_dump())
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital


@router.patch("/{hospital_id}", response_model=HospitalListOut)
def update_hospital(hospital_id: int, payload: HospitalUpdate, db: Session = Depends(get_db)):
    """হাসপাতাল তথ্য আপডেট — doc: PATCH /admin/hospitals/{id}"""
    hospital = db.scalar(select(Hospital).where(Hospital.id == hospital_id))
    if not hospital:
        raise HTTPException(404, "হাসপাতাল পাওয়া যায়নি")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(hospital, field, value)

    db.commit()
    db.refresh(hospital)
    return hospital