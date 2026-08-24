from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.article import Article, ArticleStatus
from app.models.badge import VolunteerBadge
from app.models.help_request import AssistanceLog, HelpRequest, HelpRequestUrgency
from app.models.user import VolunteerProfile
from app.schemas.profile import VolunteerPublicProfileOut
from app.services.article_service import to_article_public_out

router = APIRouter(prefix="/volunteers", tags=["Volunteer Public Profile"])


@router.get("/{slug}", response_model=VolunteerPublicProfileOut)
def get_public_profile(slug: str, db: Session = Depends(get_db)):
    """ভলান্টিয়ারের পাবলিক প্রোফাইল — doc: GET /volunteers/{slug} (শেয়ারেবল URL)"""
    profile = db.scalar(select(VolunteerProfile).where(VolunteerProfile.public_slug == slug))
    if not profile:
        raise HTTPException(404, "প্রোফাইল পাওয়া যায়নি")

    volunteer_id = profile.user_id

    total_assistance_count = db.scalar(
        select(func.count(AssistanceLog.id)).where(AssistanceLog.volunteer_id == volunteer_id)
    ) or 0

    emergency_case_count = db.scalar(
        select(func.count(HelpRequest.id)).where(
            HelpRequest.volunteer_id == volunteer_id,
            HelpRequest.urgency == HelpRequestUrgency.emergency,
        )
    ) or 0

    published_articles = db.scalars(
        select(Article)
        .where(Article.volunteer_id == volunteer_id, Article.status == ArticleStatus.approved)
        .options(selectinload(Article.tags))
        .order_by(Article.published_at.desc())
    ).all()

    badges = db.scalars(
        select(VolunteerBadge)
        .where(VolunteerBadge.volunteer_id == volunteer_id)
        .options(selectinload(VolunteerBadge.badge))
    ).all()

    return VolunteerPublicProfileOut(
        name=profile.user.name,
        public_slug=profile.public_slug,
        institution_id=profile.institution_id,
        service_upazila_id=profile.service_upazila_id,
        total_assistance_count=total_assistance_count,
        emergency_case_count=emergency_case_count,
        published_article_count=len(published_articles),
        badges=badges,
        articles=[to_article_public_out(a) for a in published_articles],
    )