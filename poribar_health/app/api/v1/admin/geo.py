from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.database import get_db
from app.models.geo import District, Upazila
from app.schemas.geo import UpazilaCreate, UpazilaOut

router = APIRouter(
    prefix="/admin/geo",
    tags=["Geo (Admin)"],
    dependencies=[Depends(require_role("super_admin"))],
)


@router.post("/upazilas", response_model=UpazilaOut, status_code=status.HTTP_201_CREATED)
def create_upazila(payload: UpazilaCreate, db: Session = Depends(get_db)):
    """নতুন উপজেলা যোগ (scalability) — doc: POST /admin/geo/upazilas"""
    district = db.get(District, payload.district_id)
    if not district:
        raise HTTPException(404, "জেলা পাওয়া যায়নি")

    upazila = Upazila(district_id=payload.district_id, name_bn=payload.name_bn, name_en=payload.name_en)
    db.add(upazila)
    db.commit()
    db.refresh(upazila)
    return upazila