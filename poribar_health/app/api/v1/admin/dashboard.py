from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.database import get_db
from app.models.user import User, VolunteerProfile
from app.schemas.analytics import AdminDashboardOut
from app.schemas.volunteer import VolunteerApprovalOut
from app.services.analytics_service import get_admin_dashboard

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_role("super_admin"))],
)


@router.get("/dashboard", response_model=AdminDashboardOut)
def admin_dashboard(db: Session = Depends(get_db)):
    """Organization-wide stats — doc: GET /admin/dashboard"""
    return get_admin_dashboard(db)


@router.get("/volunteers", response_model=list[VolunteerApprovalOut])
def list_all_volunteers(
    status: str | None = Query(None),
    upazila_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    """সকল ভলান্টিয়ার তালিকা — doc: GET /admin/volunteers"""
    stmt = select(User, VolunteerProfile).join(VolunteerProfile, VolunteerProfile.user_id == User.id)
    if status is not None:
        stmt = stmt.where(User.status == status)
    if upazila_id is not None:
        stmt = stmt.where(VolunteerProfile.service_upazila_id == upazila_id)
    rows = db.execute(stmt).all()
    return [
        VolunteerApprovalOut(
            user_id=user.id, name=user.name, phone=user.phone, status=user.status,
            student_id_no=profile.student_id_no, institution_id=profile.institution_id,
            semester=profile.semester, service_upazila_id=profile.service_upazila_id,
        )
        for user, profile in rows
    ]