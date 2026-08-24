from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user
from app.database import get_db
from app.models.help_request import HelpRequest, HelpRequestStatus
from app.models.user import User
from app.schemas.help_request import HelpRequestCreate, HelpRequestFeedback, HelpRequestOut

router = APIRouter(prefix="/help-requests", tags=["Help Requests (User)"])


@router.post("", response_model=HelpRequestOut, status_code=201)
def create_help_request(
    payload: HelpRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """সাহায্যের অনুরোধ তৈরি — doc: POST /help-requests"""
    help_request = HelpRequest(
        user_id=current_user.id,
        upazila_id=payload.upazila_id,
        type=payload.type,
        urgency=payload.urgency,
        description=payload.description,
        status=HelpRequestStatus.open,
    )
    db.add(help_request)
    db.commit()
    db.refresh(help_request)
    return help_request


@router.get("/my", response_model=list[HelpRequestOut])
def my_help_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """আমার সকল অনুরোধ — doc: GET /help-requests/my"""
    stmt = select(HelpRequest).where(HelpRequest.user_id == current_user.id).order_by(
        HelpRequest.created_at.desc()
    )
    return db.scalars(stmt).all()


@router.patch("/{help_request_id}/feedback", response_model=HelpRequestOut)
def give_feedback(
    help_request_id: int,
    payload: HelpRequestFeedback,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """সেবার পরে রেটিং দিন — doc: PATCH /help-requests/{id}/feedback"""
    help_request = db.scalar(select(HelpRequest).where(HelpRequest.id == help_request_id))
    if not help_request:
        raise HTTPException(404, "অনুরোধ পাওয়া যায়নি")
    if help_request.user_id != current_user.id:
        raise HTTPException(403, "শুধু নিজের অনুরোধেই ফিডব্যাক দেওয়া যাবে")
    if help_request.status not in (HelpRequestStatus.resolved, HelpRequestStatus.closed):
        raise HTTPException(400, "শুধু সমাধান হওয়া অনুরোধেই ফিডব্যাক দেওয়া যাবে")

    help_request.patient_feedback = payload.patient_feedback
    help_request.patient_feedback_text = payload.patient_feedback_text
    db.commit()
    db.refresh(help_request)
    return help_request