from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.badge import Certificate
from app.models.recognition import AwardNomination, ReferenceLetter
from app.models.user import User
from app.schemas.badge import CertificateOut
from app.schemas.recognition import AwardNominationOut, ReferenceLetterOut

router = APIRouter(
    prefix="/volunteer",
    tags=["My Recognition (Volunteer)"],
    dependencies=[Depends(require_role("volunteer"))],
)


@router.get("/certificates", response_model=list[CertificateOut])
def my_certificates(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """নিজের সব ইস্যু হওয়া সার্টিফিকেট — token manual পাঠানোর বদলে সরাসরি তালিকা।"""
    stmt = select(Certificate).where(Certificate.volunteer_id == current_user.id).order_by(Certificate.issued_at.desc())
    return db.scalars(stmt).all()


@router.get("/reference-letters", response_model=list[ReferenceLetterOut])
def my_reference_letters(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(ReferenceLetter).where(ReferenceLetter.volunteer_id == current_user.id).order_by(ReferenceLetter.issued_at.desc())
    return db.scalars(stmt).all()


@router.get("/awards", response_model=list[AwardNominationOut])
def my_award_nominations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(AwardNomination).where(AwardNomination.volunteer_id == current_user.id).order_by(AwardNomination.created_at.desc())
    return db.scalars(stmt).all()