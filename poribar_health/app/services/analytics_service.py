from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.article import Article, ArticleStatus
from app.models.emergency import Ambulance, BloodDonor
from app.models.hospital import Hospital
from app.models.help_request import AssistanceLog, HelpRequest, HelpRequestStatus
from app.models.user import User, UserStatus, VolunteerProfile
from app.schemas.analytics import TopVolunteerOut


def _top_volunteers(db: Session, since: datetime, upazila_id: int | None = None, limit: int = 5) -> list[TopVolunteerOut]:
    stmt = (
        select(User.id, User.name, func.count(AssistanceLog.id).label("cnt"))
        .join(AssistanceLog, AssistanceLog.volunteer_id == User.id)
        .where(AssistanceLog.created_at >= since)
    )
    if upazila_id is not None:
        stmt = stmt.join(VolunteerProfile, VolunteerProfile.user_id == User.id).where(
            VolunteerProfile.service_upazila_id == upazila_id
        )
    stmt = stmt.group_by(User.id, User.name).order_by(func.count(AssistanceLog.id).desc()).limit(limit)

    rows = db.execute(stmt).all()
    return [TopVolunteerOut(user_id=r.id, name=r.name, resolved_count=r.cnt) for r in rows]


def _requests_by_field(db: Session, field, upazila_id: int | None = None) -> dict[str, int]:
    stmt = select(field, func.count(HelpRequest.id)).group_by(field)
    if upazila_id is not None:
        stmt = stmt.where(HelpRequest.upazila_id == upazila_id)
    rows = db.execute(stmt).all()
    return {(k.value if hasattr(k, "value") else str(k)): v for k, v in rows}


def get_admin_dashboard(db: Session) -> dict:
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_users = db.scalar(select(func.count(User.id))) or 0
    total_volunteers_active = db.scalar(
        select(func.count(VolunteerProfile.id))
        .join(User, User.id == VolunteerProfile.user_id)
        .where(User.status == UserStatus.active)
    ) or 0
    pending_volunteer_approvals = db.scalar(
        select(func.count(VolunteerProfile.id))
        .join(User, User.id == VolunteerProfile.user_id)
        .where(User.status == UserStatus.pending)
    ) or 0

    total_help_requests = db.scalar(select(func.count(HelpRequest.id))) or 0
    open_help_requests = db.scalar(
        select(func.count(HelpRequest.id)).where(HelpRequest.status == HelpRequestStatus.open)
    ) or 0
    resolved_help_requests = db.scalar(
        select(func.count(HelpRequest.id)).where(HelpRequest.status == HelpRequestStatus.resolved)
    ) or 0

    total_hospitals = db.scalar(select(func.count(Hospital.id))) or 0
    total_ambulances = db.scalar(select(func.count(Ambulance.id))) or 0
    available_ambulances = db.scalar(
        select(func.count(Ambulance.id)).where(Ambulance.availability_status.is_(True))
    ) or 0
    total_blood_donors = db.scalar(select(func.count(BloodDonor.id))) or 0
    published_articles_count = db.scalar(
        select(func.count(Article.id)).where(Article.status == ArticleStatus.approved)
    ) or 0

    return {
        "total_users": total_users,
        "total_volunteers_active": total_volunteers_active,
        "pending_volunteer_approvals": pending_volunteer_approvals,
        "total_help_requests": total_help_requests,
        "open_help_requests": open_help_requests,
        "resolved_help_requests": resolved_help_requests,
        "total_hospitals": total_hospitals,
        "total_ambulances": total_ambulances,
        "available_ambulances": available_ambulances,
        "total_blood_donors": total_blood_donors,
        "published_articles_count": published_articles_count,
        "requests_by_type": _requests_by_field(db, HelpRequest.type),
        "requests_by_status": _requests_by_field(db, HelpRequest.status),
        "top_volunteers_this_month": _top_volunteers(db, month_start),
    }


def get_director_analytics(db: Session, upazila_id: int) -> dict:
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_volunteers_active = db.scalar(
        select(func.count(VolunteerProfile.id))
        .join(User, User.id == VolunteerProfile.user_id)
        .where(User.status == UserStatus.active, VolunteerProfile.service_upazila_id == upazila_id)
    ) or 0
    pending_volunteer_approvals = db.scalar(
        select(func.count(VolunteerProfile.id))
        .join(User, User.id == VolunteerProfile.user_id)
        .where(User.status == UserStatus.pending, VolunteerProfile.service_upazila_id == upazila_id)
    ) or 0

    total_help_requests = db.scalar(
        select(func.count(HelpRequest.id)).where(HelpRequest.upazila_id == upazila_id)
    ) or 0
    resolved_help_requests = db.scalar(
        select(func.count(HelpRequest.id)).where(
            HelpRequest.upazila_id == upazila_id, HelpRequest.status == HelpRequestStatus.resolved
        )
    ) or 0
    pending_article_reviews = db.scalar(
        select(func.count(Article.id)).where(Article.status == ArticleStatus.pending)
    ) or 0

    return {
        "upazila_id": upazila_id,
        "total_volunteers_active": total_volunteers_active,
        "pending_volunteer_approvals": pending_volunteer_approvals,
        "total_help_requests": total_help_requests,
        "resolved_help_requests": resolved_help_requests,
        "pending_article_reviews": pending_article_reviews,
        "requests_by_type": _requests_by_field(db, HelpRequest.type, upazila_id=upazila_id),
        "top_volunteers_this_month": _top_volunteers(db, month_start, upazila_id=upazila_id),
    }


def get_impact_report(db: Session, year: int, month: int | None = None) -> dict:
    if month:
        period_start = datetime(year, month, 1, tzinfo=timezone.utc)
        period_end = datetime(year + (1 if month == 12 else 0), (month % 12) + 1, 1, tzinfo=timezone.utc)
    else:
        period_start = datetime(year, 1, 1, tzinfo=timezone.utc)
        period_end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)

    total_help_requests = db.scalar(
        select(func.count(HelpRequest.id)).where(
            HelpRequest.created_at >= period_start, HelpRequest.created_at < period_end
        )
    ) or 0
    total_resolved = db.scalar(
        select(func.count(HelpRequest.id)).where(
            HelpRequest.resolved_at >= period_start,
            HelpRequest.resolved_at < period_end,
            HelpRequest.status == HelpRequestStatus.resolved,
        )
    ) or 0
    total_articles_published = db.scalar(
        select(func.count(Article.id)).where(
            Article.published_at >= period_start,
            Article.published_at < period_end,
            Article.status == ArticleStatus.approved,
        )
    ) or 0
    total_new_volunteers = db.scalar(
        select(func.count(VolunteerProfile.id)).where(
            VolunteerProfile.verified_at >= period_start, VolunteerProfile.verified_at < period_end
        )
    ) or 0

    requests_by_type_stmt = (
        select(HelpRequest.type, func.count(HelpRequest.id))
        .where(HelpRequest.created_at >= period_start, HelpRequest.created_at < period_end)
        .group_by(HelpRequest.type)
    )
    requests_by_type = {(k.value if hasattr(k, "value") else str(k)): v for k, v in db.execute(requests_by_type_stmt).all()}

    top_volunteers = _top_volunteers(db, period_start, limit=10)

    return {
        "year": year,
        "month": month,
        "total_help_requests": total_help_requests,
        "total_resolved": total_resolved,
        "total_articles_published": total_articles_published,
        "total_new_volunteers": total_new_volunteers,
        "requests_by_type": requests_by_type,
        "top_volunteers": top_volunteers,
    }