from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.badge import Badge, VolunteerBadge
from app.models.help_request import AssistanceLog
from app.services.notification_service import create_notification


def check_and_award(db: Session, volunteer_id: int, awarded_by: int | None = None) -> list[Badge]:
    """
    Laravel BadgeService.checkAndAward()-এর সমতুল্য।
    volunteer-এর মোট assistance_logs count দেখে, criteria পূরণ হওয়া প্রতিটা badge
    (যেগুলো এখনো দেওয়া হয়নি) award করে। ইতিমধ্যে দেওয়া badge আবার দেয় না (idempotent)।

    রিটার্ন করে নতুন করে award হওয়া badge-গুলোর তালিকা। প্রতিটা নতুন badge-এর জন্য
    volunteer-কে একটা in-app notification-ও পাঠানো হয় (M9)।
    """
    assistance_count = db.scalar(
        select(func.count(AssistanceLog.id)).where(AssistanceLog.volunteer_id == volunteer_id)
    ) or 0

    eligible_badges = db.scalars(
        select(Badge).where(
            Badge.criteria_type == "assistance_count",
            Badge.criteria_value <= assistance_count,
        )
    ).all()

    already_awarded_badge_ids = set(
        db.scalars(
            select(VolunteerBadge.badge_id).where(VolunteerBadge.volunteer_id == volunteer_id)
        ).all()
    )

    newly_awarded: list[Badge] = []
    for badge in eligible_badges:
        if badge.id in already_awarded_badge_ids:
            continue
        db.add(
            VolunteerBadge(
                volunteer_id=volunteer_id,
                badge_id=badge.id,
                awarded_at=datetime.now(timezone.utc),
                awarded_by=awarded_by,
            )
        )
        newly_awarded.append(badge)

    if newly_awarded:
        db.commit()
        for badge in newly_awarded:
            create_notification(
                db, volunteer_id, type="badge_awarded",
                title=f"অভিনন্দন! তুমি '{badge.name_bn}' ব্যাজ অর্জন করেছ",
                body=badge.description,
                related_type="badge", related_id=badge.id,
            )

    return newly_awarded