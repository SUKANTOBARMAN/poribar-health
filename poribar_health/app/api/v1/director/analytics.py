from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.user import User
from app.schemas.analytics import DirectorAnalyticsOut
from app.services.analytics_service import get_director_analytics

router = APIRouter(
    prefix="/director",
    tags=["Director Analytics"],
    dependencies=[Depends(require_role("director", "super_admin"))],
)


@router.get("/analytics", response_model=DirectorAnalyticsOut)
def director_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """এলাকার impact analytics — doc: GET /director/analytics"""
    upazila_id = current_user.upazila_id
    if not upazila_id:
        raise HTTPException(400, "তোমার এলাকা (upazila) সেট করা নেই — প্রোফাইল আপডেট করো")
    return get_director_analytics(db, upazila_id)