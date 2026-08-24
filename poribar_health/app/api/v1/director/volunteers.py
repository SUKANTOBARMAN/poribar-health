from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.user import User, UserStatus, VolunteerProfile
from app.schemas.volunteer import VolunteerApprovalOut, VolunteerRejectPayload
from app.services.notification_service import create_notification

router = APIRouter(
    prefix="/director/volunteers",
    tags=["Volunteers (Director)"],
    dependencies=[Depends(require_role("director", "super_admin"))],
)


def _to_out(user: User, profile: VolunteerProfile | None) -> VolunteerApprovalOut:
    return VolunteerApprovalOut(
        user_id=user.id,
        name=user.name,
        phone=user.phone,
        status=user.status,
        student_id_no=profile.student_id_no if profile else None,
        institution_id=profile.institution_id if profile else None,
        semester=profile.semester if profile else None,
        service_upazila_id=profile.service_upazila_id if profile else None,
    )


@router.get("", response_model=list[VolunteerApprovalOut])
def list_volunteers(
    status: str = Query("pending"),
    db: Session = Depends(get_db),
):
    """অনুমোদনের অপেক্ষায় ভলান্টিয়ার — doc: GET /director/volunteers?status=pending"""
    stmt = (
        select(User, VolunteerProfile)
        .join(VolunteerProfile, VolunteerProfile.user_id == User.id)
        .where(User.status == status)
    )
    rows = db.execute(stmt).all()
    return [_to_out(user, profile) for user, profile in rows]


@router.patch("/{user_id}/approve", response_model=VolunteerApprovalOut)
def approve_volunteer(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """ভলান্টিয়ার অনুমোদন — doc: PATCH /director/volunteers/{id}/approve"""
    user = db.get(User, user_id)
    if not user or not user.volunteer_profile:
        raise HTTPException(404, "ভলান্টিয়ার পাওয়া যায়নি")
    if user.status != UserStatus.pending:
        raise HTTPException(400, "শুধু pending ভলান্টিয়ারই অনুমোদন করা যাবে")

    user.status = UserStatus.active
    user.volunteer_profile.verified_at = datetime.now(timezone.utc)
    user.volunteer_profile.verified_by = current_user.id
    db.commit()
    db.refresh(user)

    # M9: notify volunteer (in-app + SMS)
    create_notification(
        db, user.id, type="volunteer_approved",
        title="তোমার ভলান্টিয়ার আবেদন অনুমোদিত হয়েছে",
        body="তুমি এখন Poribar Health-এ ভলান্টিয়ার হিসেবে সাহায্য করতে পারবে।",
    )
    try:
        from app.jobs.notification_tasks import send_sms_task

        send_sms_task.delay(user.phone, "Poribar Health: আপনার ভলান্টিয়ার আবেদন অনুমোদিত হয়েছে। এখন লগইন করুন।")
    except Exception:
        pass  # Celery/Redis দূরে থাকলেও মূল রিকোয়েস্ট যেন ব্যর্থ না হয়

    return _to_out(user, user.volunteer_profile)


@router.patch("/{user_id}/reject", response_model=VolunteerApprovalOut)
def reject_volunteer(user_id: int, payload: VolunteerRejectPayload, db: Session = Depends(get_db)):
    """প্রত্যাখ্যান + কারণ — doc: PATCH /director/volunteers/{id}/reject"""
    user = db.get(User, user_id)
    if not user or not user.volunteer_profile:
        raise HTTPException(404, "ভলান্টিয়ার পাওয়া যায়নি")
    if user.status != UserStatus.pending:
        raise HTTPException(400, "শুধু pending ভলান্টিয়ারই প্রত্যাখ্যান করা যাবে")

    user.status = UserStatus.suspended
    db.commit()
    db.refresh(user)

    # M9: notify volunteer
    create_notification(
        db, user.id, type="volunteer_rejected",
        title="তোমার ভলান্টিয়ার আবেদন প্রত্যাখ্যাত হয়েছে",
        body=payload.reason,
    )

    return _to_out(user, user.volunteer_profile)