from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.recognition import ReferenceLetter
from app.models.user import User
from app.schemas.recognition import ReferenceLetterIssueRequest, ReferenceLetterOut
from app.services.notification_service import create_notification

router = APIRouter(
    prefix="/director/reference-letters",
    tags=["Reference Letters (Director)"],
    dependencies=[Depends(require_role("director", "super_admin"))],
)


@router.post("/issue", response_model=ReferenceLetterOut, status_code=201)
def issue_reference_letter(
    payload: ReferenceLetterIssueRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    doc M10: "Certificates + reference letter generator" — এই endpoint দিয়ে
    ভলান্টিয়ারের জন্য একটা reference letter তৈরি হয়, volunteer পরে token দিয়ে PDF ডাউনলোড করবে।
    """
    volunteer = db.get(User, payload.volunteer_id)
    if not volunteer or not volunteer.volunteer_profile:
        raise HTTPException(404, "ভলান্টিয়ার পাওয়া যায়নি")

    letter = ReferenceLetter(
        volunteer_id=payload.volunteer_id,
        issued_by=current_user.id,
        purpose=payload.purpose,
        issued_at=datetime.now(timezone.utc),
    )
    db.add(letter)
    db.commit()
    db.refresh(letter)

    create_notification(
        db, volunteer.id, type="reference_letter_issued",
        title="তোমার জন্য একটা Reference Letter ইস্যু হয়েছে",
        body="ড্যাশবোর্ড থেকে এখন এটা PDF আকারে ডাউনলোড করতে পারবে।",
        related_type="reference_letter", related_id=letter.id,
    )

    return letter