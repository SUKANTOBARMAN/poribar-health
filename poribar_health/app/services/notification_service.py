from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    body: str | None = None,
    related_type: str | None = None,
    related_id: int | None = None,
    commit: bool = True,
) -> Notification:
    """
    যেকোনো route থেকে কল করা যায় — যেমন volunteer approve হলে, badge award হলে,
    article review হলে ইত্যাদি। commit=False দিলে caller নিজে commit করবে
    (একই request-এ অন্য কিছুর সাথে একসাথে সেভ করতে চাইলে কাজে লাগবে)।
    """
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        related_type=related_type,
        related_id=related_id,
    )
    db.add(notification)
    if commit:
        db.commit()
        db.refresh(notification)
    return notification