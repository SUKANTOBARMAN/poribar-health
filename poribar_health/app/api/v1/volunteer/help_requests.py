from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.help_request import AssistanceLog, HelpRequest, HelpRequestStatus
from app.models.user import User
from app.schemas.help_request import AssistanceLogOut, HelpRequestOut, HelpRequestVolunteerUpdate
from app.services.notification_service import create_notification

router = APIRouter(
    prefix="/volunteer",
    tags=["Help Requests (Volunteer)"],
    dependencies=[Depends(require_role("volunteer"))],
)


def _volunteer_scope_upazila_id(current_user: User) -> int:
    """
    Security Note (doc): "Volunteer শুধু নিজের উপজেলার help_requests দেখতে পারবেন — Query Scope দিয়ে enforce"
    VolunteerProfile.service_upazila_id-কেই primary scope ধরা হয়েছে; না থাকলে user.upazila_id ফলব্যাক।
    """
    profile = current_user.volunteer_profile
    if profile and profile.service_upazila_id:
        return profile.service_upazila_id
    if current_user.upazila_id:
        return current_user.upazila_id
    raise HTTPException(400, "তোমার সার্ভিস এলাকা (upazila) সেট করা নেই — প্রোফাইল আপডেট করো")


@router.get("/requests", response_model=list[HelpRequestOut])
def list_area_requests(
    status: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """এলাকার help requests — doc: GET /volunteer/requests?status="""
    upazila_id = _volunteer_scope_upazila_id(current_user)
    stmt = select(HelpRequest).where(HelpRequest.upazila_id == upazila_id)
    if status:
        stmt = stmt.where(HelpRequest.status == status)
    stmt = stmt.order_by(HelpRequest.created_at.desc())
    return db.scalars(stmt).all()


@router.post("/requests/{help_request_id}/accept", response_model=HelpRequestOut)
def accept_request(
    help_request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """রিকোয়েস্ট গ্রহণ — doc: POST /volunteer/requests/{id}/accept"""
    upazila_id = _volunteer_scope_upazila_id(current_user)
    help_request = db.scalar(select(HelpRequest).where(HelpRequest.id == help_request_id))
    if not help_request:
        raise HTTPException(404, "অনুরোধ পাওয়া যায়নি")
    if help_request.upazila_id != upazila_id:
        raise HTTPException(403, "এটা তোমার সার্ভিস এলাকার বাইরে")
    if help_request.status != HelpRequestStatus.open:
        raise HTTPException(400, "এই অনুরোধ ইতিমধ্যে গ্রহণ করা হয়েছে অথবা বন্ধ")

    help_request.status = HelpRequestStatus.accepted
    help_request.volunteer_id = current_user.id
    db.commit()
    db.refresh(help_request)
    
    # M9: patient-কে জানানো হচ্ছে যে একজন volunteer অনুরোধ গ্রহণ করেছে
    create_notification(
        db, help_request.user_id, type="help_request_accepted",
        title="তোমার অনুরোধ গ্রহণ করা হয়েছে",
        body=f"{current_user.name} তোমার সাহায্যের অনুরোধটি গ্রহণ করেছেন।",
        related_type="help_request", related_id=help_request.id,
    )
    
    return help_request


@router.patch("/requests/{help_request_id}/update", response_model=HelpRequestOut)
def update_request(
    help_request_id: int,
    payload: HelpRequestVolunteerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """status + action_taken আপডেট — doc: PATCH /volunteer/requests/{id}/update (প্রতিটা আপডেট log হবে)"""
    help_request = db.scalar(select(HelpRequest).where(HelpRequest.id == help_request_id))
    if not help_request:
        raise HTTPException(404, "অনুরোধ পাওয়া যায়নি")
    if help_request.volunteer_id != current_user.id:
        raise HTTPException(403, "শুধু যেই volunteer গ্রহণ করেছে সেই আপডেট করতে পারবে")

    help_request.status = payload.status
    db.add(
        AssistanceLog(
            volunteer_id=current_user.id,
            help_request_id=help_request.id,
            action_taken=payload.action_taken,
            outcome=payload.outcome,
        )
    )
    db.commit()
    db.refresh(help_request)
    return help_request


@router.post("/requests/{help_request_id}/resolve", response_model=HelpRequestOut)
def resolve_request(
    help_request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """সমাধান হিসেবে মার্ক — doc: POST /volunteer/requests/{id}/resolve (এরপর Article লেখার prompt)"""
    help_request = db.scalar(select(HelpRequest).where(HelpRequest.id == help_request_id))
    if not help_request:
        raise HTTPException(404, "অনুরোধ পাওয়া যায়নি")
    if help_request.volunteer_id != current_user.id:
        raise HTTPException(403, "শুধু যেই volunteer গ্রহণ করেছে সেই resolve করতে পারবে")

    help_request.status = HelpRequestStatus.resolved
    help_request.resolved_at = datetime.now(timezone.utc)
    db.add(
        AssistanceLog(
            volunteer_id=current_user.id,
            help_request_id=help_request.id,
            action_taken="সমাধান হিসেবে চিহ্নিত করা হয়েছে",
            outcome="resolved",
        )
    )
    db.commit()
    db.refresh(help_request)

    # BadgeService trigger — synchronous call (M7) যাতে তক্ষুণি badge award হয়ে যায়
    from app.services.badge_service import check_and_award

    check_and_award(db, current_user.id)

    # Celery dispatch — async ব্যাকআপ (ভবিষ্যতে notification পাঠানোর জন্য কাজে লাগবে)
    try:
        from app.jobs.badge_tasks import check_and_award_badge

        check_and_award_badge.delay(current_user.id)
    except Exception:
        pass  # Celery/Redis দূরে থাকলেও মূল রিকোয়েস্ট যেন ব্যর্থ না হয়

    return help_request


@router.get("/assistance-log", response_model=list[AssistanceLogOut])
def my_assistance_log(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """নিজের সহায়তার ইতিহাস — doc: GET /volunteer/assistance-log"""
    stmt = (
        select(AssistanceLog)
        .where(AssistanceLog.volunteer_id == current_user.id)
        .order_by(AssistanceLog.created_at.desc())
    )
    return db.scalars(stmt).all()