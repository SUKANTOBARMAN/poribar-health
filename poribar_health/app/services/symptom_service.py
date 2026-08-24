from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.symptom import Specialty, SymptomSpecialty


def suggest_specialties(db: Session, symptom_ids: list[int]) -> list[tuple[Specialty, int]]:
    """
    দেওয়া লক্ষণগুলোর জন্য কোন বিশেষজ্ঞ বিভাগে যাওয়া উচিত সেটা বের করে।
    প্রতিটা symptom_specialty-এর weight যোগ করে specialty-ভিত্তিক স্কোর বানায়,
    সবচেয়ে বেশি স্কোর যেই specialty-র, সেটাই সবচেয়ে প্রাসঙ্গিক।
    """
    rows = db.execute(
        select(SymptomSpecialty).where(SymptomSpecialty.symptom_id.in_(symptom_ids))
    ).scalars().all()

    scores: dict[int, int] = {}
    for row in rows:
        scores[row.specialty_id] = scores.get(row.specialty_id, 0) + row.weight

    if not scores:
        return []

    specialties = db.execute(
        select(Specialty).where(Specialty.id.in_(scores.keys()))
    ).scalars().all()
    specialty_map = {s.id: s for s in specialties}

    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    return [(specialty_map[specialty_id], score) for specialty_id, score in ranked if specialty_id in specialty_map]