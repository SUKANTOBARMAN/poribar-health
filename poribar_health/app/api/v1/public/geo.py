from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.geo import District, Division, Upazila, Union
from app.schemas.geo import DistrictOut, DivisionOut, UpazilaOut, UnionOut

router = APIRouter(prefix="/geo", tags=["Geo (Public)"])


@router.get("/divisions", response_model=list[DivisionOut])
def list_divisions(db: Session = Depends(get_db)):
    return db.scalars(select(Division)).all()


@router.get("/districts", response_model=list[DistrictOut])
def list_districts(division_id: int = Query(...), db: Session = Depends(get_db)):
    return db.scalars(select(District).where(District.division_id == division_id)).all()


@router.get("/upazilas", response_model=list[UpazilaOut])
def list_upazilas(district_id: int = Query(...), db: Session = Depends(get_db)):
    return db.scalars(select(Upazila).where(Upazila.district_id == district_id)).all()


@router.get("/unions", response_model=list[UnionOut])
def list_unions(upazila_id: int = Query(...), db: Session = Depends(get_db)):
    return db.scalars(select(Union).where(Union.upazila_id == upazila_id)).all()