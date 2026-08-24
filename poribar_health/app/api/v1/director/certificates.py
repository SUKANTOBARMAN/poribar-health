from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.badge import Certificate
from app.models.user import User
from app.schemas.badge import CertificateIssueRequest, CertificateOut

router = APIRouter(
    prefix="/director/certificates",
    tags=["Certificates (Director)"],
    dependencies=[Depends(require_role("director", "super_admin"))],
)


@router.post("/issue", response_model=CertificateOut, status_code=201)
def issue_certificate(
    payload: CertificateIssueRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """সার্টিফিকেট ইস্যু — doc: POST /director/certificates/issue"""
    volunteer = db.get(User, payload.volunteer_id)
    if not volunteer or not volunteer.volunteer_profile:
        raise HTTPException(404, "ভলান্টিয়ার পাওয়া যায়নি")

    certificate = Certificate(
        volunteer_id=payload.volunteer_id,
        type=payload.type,
        issued_at=datetime.now(timezone.utc),
        issued_by=current_user.id,
    )
    db.add(certificate)
    db.commit()
    db.refresh(certificate)
    return certificate