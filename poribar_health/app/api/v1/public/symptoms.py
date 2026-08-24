from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.symptom import Symptom
from app.schemas.symptom import SymptomCheckRequest, SymptomCheckResponse, SymptomOut, SpecialtySuggestion
from app.services.symptom_service import suggest_specialties

router = APIRouter(tags=["Symptom Checker (Public)"])


@router.get("/symptoms", response_model=list[SymptomOut])
def list_symptoms(db: Session = Depends(get_db)):
    """লক্ষণ তালিকা — symptom checker-এর Step 2 (icon-based tag chips)-এর জন্য দরকার।"""
    return db.scalars(select(Symptom)).all()


@router.post("/symptom-check", response_model=SymptomCheckResponse)
def symptom_check(payload: SymptomCheckRequest, db: Session = Depends(get_db)):
    """লক্ষণ → বিশেষজ্ঞ বিভাগ সাজেশন — doc: POST /symptom-check"""
    ranked = suggest_specialties(db, payload.symptom_ids)
    return SymptomCheckResponse(
        suggestions=[
            SpecialtySuggestion(specialty=specialty, score=score) for specialty, score in ranked
        ]
    )