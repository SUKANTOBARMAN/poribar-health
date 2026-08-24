from app.database import SessionLocal
from app.jobs.celery_app import celery_app


@celery_app.task(name="jobs.check_and_award_badge")
def check_and_award_badge(volunteer_id: int) -> list[int]:
    """
    Runs after each assistance_log insert — Laravel BadgeService.checkAndAward() এর async ভার্সন।
    resolve_request()-এ ইতিমধ্যে synchronous ভাবে app.services.badge_service.check_and_award()
    কল করা হয় (immediate feedback-এর জন্য); এই Celery task সেটারই idempotent async ব্যাকআপ —
    ভবিষ্যতে badge award হলে SMS/notification পাঠানোর মতো ভারী কাজ এখানে যোগ করা যাবে।
    """
    from app.services.badge_service import check_and_award

    db = SessionLocal()
    try:
        newly_awarded = check_and_award(db, volunteer_id)
        return [badge.id for badge in newly_awarded]
    finally:
        db.close()