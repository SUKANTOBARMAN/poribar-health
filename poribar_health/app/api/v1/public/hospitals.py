from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.hospital import Department, Hospital
from app.schemas.hospital import HospitalDetailOut, HospitalListOut

router = APIRouter(prefix="/hospitals", tags=["Hospitals (Public)"])


@router.get("", response_model=list[HospitalListOut])
def list_hospitals(
    upazila_id: int | None = Query(None),
    emergency_available: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    """হাসপাতাল তালিকা (ফিল্টার) — doc: GET /hospitals?upazila_id="""
    stmt = select(Hospital)
    if upazila_id is not None:
        stmt = stmt.where(Hospital.upazila_id == upazila_id)
    if emergency_available is not None:
        stmt = stmt.where(Hospital.emergency_available == emergency_available)
    return db.scalars(stmt).all()


@router.get("/{hospital_id}", response_model=HospitalDetailOut)
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    """হাসপাতালের বিস্তারিত + বিভাগ + ডাক্তার — doc: GET /hospitals/{id}"""
    hospital = db.scalar(
        select(Hospital)
        .where(Hospital.id == hospital_id)
        .options(selectinload(Hospital.departments).selectinload(Department.doctors))
    )
    if not hospital:
        raise HTTPException(404, "হাসপাতাল পাওয়া যায়নি")
    return hospital