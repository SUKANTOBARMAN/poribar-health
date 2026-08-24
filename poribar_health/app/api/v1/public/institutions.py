from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.institution import Institution
from app.schemas.institution import InstitutionOut

router = APIRouter(prefix="/institutions", tags=["Institutions (Public)"])


@router.get("", response_model=list[InstitutionOut])
def list_institutions(upazila_id: int | None = Query(None), db: Session = Depends(get_db)):
    """volunteer registration form-এ dropdown populate করার জন্য"""
    stmt = select(Institution)
    if upazila_id is not None:
        stmt = stmt.where(Institution.upazila_id == upazila_id)
    return db.scalars(stmt).all()