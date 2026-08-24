from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.badge import Certificate, VolunteerBadge
from app.models.help_request import AssistanceLog, HelpRequest, HelpRequestStatus
from app.models.user import User, VolunteerProfile
from app.schemas.profile import VolunteerDashboardOut
from app.services.certificate_service import render_certificate_pdf

router = APIRouter(
    prefix="/volunteer",
    tags=["Volunteer Dashboard"],
    dependencies=[Depends(require_role("volunteer"))],
)


@router.get("/dashboard", response_model=VolunteerDashboardOut)
def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """ড্যাশবোর্ড stats (মোট সহায়তা, ব্যাজ, ranking) — doc: GET /volunteer/dashboard"""
    total_assistance_count = db.scalar(
        select(func.count(AssistanceLog.id)).where(AssistanceLog.volunteer_id == current_user.id)
    ) or 0

    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month_assistance_count = db.scalar(
        select(func.count(AssistanceLog.id)).where(
            AssistanceLog.volunteer_id == current_user.id,
            AssistanceLog.created_at >= month_start,
        )
    ) or 0

    pending_requests_count = db.scalar(
        select(func.count(HelpRequest.id)).where(
            HelpRequest.volunteer_id == current_user.id,
            HelpRequest.status.in_([HelpRequestStatus.accepted, HelpRequestStatus.inprogress]),
        )
    ) or 0

    badges = db.scalars(
        select(VolunteerBadge)
        .where(VolunteerBadge.volunteer_id == current_user.id)
        .options(selectinload(VolunteerBadge.badge))
    ).all()

    # Ranking: নিজের সার্ভিস এলাকার (upazila) মধ্যে resolved-count অনুযায়ী position
    profile = current_user.volunteer_profile
    scope_upazila_id = profile.service_upazila_id if profile else current_user.upazila_id

    area_counts_stmt = (
        select(VolunteerProfile.user_id, func.count(AssistanceLog.id).label("cnt"))
        .join(AssistanceLog, AssistanceLog.volunteer_id == VolunteerProfile.user_id, isouter=True)
        .where(VolunteerProfile.service_upazila_id == scope_upazila_id)
        .group_by(VolunteerProfile.user_id)
        .order_by(func.count(AssistanceLog.id).desc())
    )
    area_rows = db.execute(area_counts_stmt).all()
    total_volunteers_in_area = len(area_rows)
    rank = next((i + 1 for i, row in enumerate(area_rows) if row.user_id == current_user.id), total_volunteers_in_area)

    return VolunteerDashboardOut(
        total_assistance_count=total_assistance_count,
        this_month_assistance_count=this_month_assistance_count,
        pending_requests_count=pending_requests_count,
        badges=badges,
        rank=rank,
        total_volunteers_in_area=total_volunteers_in_area,
    )


@router.get("/certificate/{token}")
def download_certificate(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """সার্টিফিকেট ডাউনলোড (PDF) — doc: GET /volunteer/certificate/{token}"""
    certificate = db.scalar(select(Certificate).where(Certificate.token == token))
    if not certificate:
        raise HTTPException(404, "সার্টিফিকেট পাওয়া যায়নি")
    if certificate.volunteer_id != current_user.id:
        raise HTTPException(403, "এটা তোমার সার্টিফিকেট না")

    pdf_bytes = render_certificate_pdf(
        volunteer_name=current_user.name,
        cert_type=certificate.type,
        issued_at=certificate.issued_at,
        token=certificate.token,
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="certificate_{token}.pdf"'},
    )