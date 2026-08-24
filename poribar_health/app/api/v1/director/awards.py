from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.recognition import AwardNomination, AwardStatus
from app.models.user import User
from app.schemas.recognition import AwardDecisionRequest, AwardNominateRequest, AwardNominationOut
from app.services.notification_service import create_notification

router = APIRouter(
    prefix="/director/awards",
    tags=["Awards (Director)"],
    dependencies=[Depends(require_role("director", "super_admin"))],
)


@router.post("/nominate", response_model=AwardNominationOut, status_code=201)
def nominate(
    payload: AwardNominateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """বিশেষ পুরস্কারের মনোনয়ন — doc: POST /director/awards/nominate"""
    volunteer = db.get(User, payload.volunteer_id)
    if not volunteer or not volunteer.volunteer_profile:
        raise HTTPException(404, "ভলান্টিয়ার পাওয়া যায়নি")

    nomination = AwardNomination(
        volunteer_id=payload.volunteer_id,
        nominated_by=current_user.id,
        award_title=payload.award_title,
        reason=payload.reason,
        status=AwardStatus.pending,
    )
    db.add(nomination)
    db.commit()
    db.refresh(nomination)
    return nomination


@router.get("", response_model=list[AwardNominationOut])
def list_nominations(status: str | None = Query(None), db: Session = Depends(get_db)):
    """মনোনয়ন তালিকা (super_admin চূড়ান্ত সিদ্ধান্তের জন্য দেখবে)"""
    stmt = select(AwardNomination).order_by(AwardNomination.created_at.desc())
    if status is not None:
        stmt = stmt.where(AwardNomination.status == status)
    return db.scalars(stmt).all()


@router.patch("/{nomination_id}/decide", response_model=AwardNominationOut)
def decide_nomination(
    nomination_id: int,
    payload: AwardDecisionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    চূড়ান্ত সিদ্ধান্ত — super_admin অনুমোদন/প্রত্যাখ্যান করবে (doc-এ explicit endpoint নেই,
    কিন্তু nominate থাকলে decide করার উপায়ও লাগবে — যুক্তিসঙ্গত সংযোজন)।
    """
    nomination = db.get(AwardNomination, nomination_id)
    if not nomination:
        raise HTTPException(404, "মনোনয়ন পাওয়া যায়নি")
    if nomination.status != AwardStatus.pending:
        raise HTTPException(400, "শুধু pending মনোনয়নই সিদ্ধান্ত নেওয়া যাবে")

    nomination.status = AwardStatus.approved if payload.approve else AwardStatus.rejected
    nomination.decided_by = current_user.id
    nomination.decided_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(nomination)

    if payload.approve:
        create_notification(
            db, nomination.volunteer_id, type="award_approved",
            title=f"অভিনন্দন! তুমি '{nomination.award_title}' পুরস্কারের জন্য নির্বাচিত হয়েছ",
            body=payload.note,
            related_type="award_nomination", related_id=nomination.id,
        )

    return nomination