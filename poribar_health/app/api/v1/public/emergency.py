from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user_optional
from app.database import get_db
from app.models.emergency import Ambulance, BloodDonor, ContactVisibility
from app.models.user import User
from app.schemas.emergency import AmbulanceOut, BloodDonorPublicOut

router = APIRouter(tags=["Emergency (Public)"])


@router.get("/ambulances", response_model=list[AmbulanceOut])
def list_ambulances(
    upazila_id: int | None = Query(None),
    available_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    """অ্যাম্বুলেন্স তালিকা — doc: GET /ambulances?upazila_id="""
    stmt = select(Ambulance)
    if upazila_id is not None:
        stmt = stmt.where(Ambulance.upazila_id == upazila_id)
    if available_only:
        stmt = stmt.where(Ambulance.availability_status.is_(True))
    return db.scalars(stmt).all()


@router.get("/blood-donors", response_model=list[BloodDonorPublicOut])
def search_blood_donors(
    blood_group: str | None = Query(None),
    upazila_id: int | None = Query(None),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    রক্তদাতা খোঁজ — doc: GET /blood-donors?blood_group=&upazila_id=

    Privacy রুল (doc-এর contact_visibility ফিল্ড অনুযায়ী):
    - visibility='public' → সবাই ফোন নম্বর দেখতে পাবে
    - visibility='volunteers_only' → শুধু লগইন করা volunteer/director/super_admin ফোন নম্বর দেখবে,
      বাকিদের কাছে ফোন নম্বর null থাকবে (কিন্তু ডোনার যে আছে সেটা জানা যাবে)
    """
    stmt = select(BloodDonor).where(BloodDonor.is_available.is_(True))
    if blood_group is not None:
        stmt = stmt.where(BloodDonor.blood_group == blood_group)
    if upazila_id is not None:
        stmt = stmt.where(BloodDonor.upazila_id == upazila_id)

    donors = db.scalars(stmt).all()

    is_privileged_viewer = current_user is not None and (
        current_user.has_role("volunteer")
        or current_user.has_role("director")
        or current_user.has_role("super_admin")
    )

    results = []
    for donor in donors:
        show_contact = donor.contact_visibility == ContactVisibility.public or is_privileged_viewer
        results.append(
            BloodDonorPublicOut(
                id=donor.id,
                blood_group=donor.blood_group,
                upazila_id=donor.upazila_id,
                last_donated_at=donor.last_donated_at,
                is_available=donor.is_available,
                contact_phone=donor.user.phone if show_contact else None,
            )
        )
    return results