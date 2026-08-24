from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.article import Article, ArticleStatus
from app.models.user import User
from app.schemas.article import ArticleOut, ArticleReject
from app.services.article_service import to_article_out
from app.services.notification_service import create_notification

router = APIRouter(
    prefix="/director/articles",
    tags=["Articles (Director)"],
    dependencies=[Depends(require_role("director", "super_admin"))],
)


@router.get("", response_model=list[ArticleOut])
def list_articles_for_review(
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """রিভিউর অপেক্ষায় আর্টিকেল — doc: GET /director/articles?status=pending"""
    stmt = select(Article).options(selectinload(Article.tags)).order_by(Article.created_at.desc())
    if status is not None:
        stmt = stmt.where(Article.status == status)
    articles = db.scalars(stmt).all()
    return [to_article_out(a) for a in articles]


@router.patch("/{article_id}/approve", response_model=ArticleOut)
def approve_article(
    article_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """আর্টিকেল অনুমোদন — doc: PATCH /director/articles/{id}/approve"""
    article = db.scalar(select(Article).where(Article.id == article_id))
    if not article:
        raise HTTPException(404, "আর্টিকেল পাওয়া যায়নি")
    if article.status != ArticleStatus.pending:
        raise HTTPException(400, "শুধু pending আর্টিকেলই অনুমোদন করা যাবে")

    article.status = ArticleStatus.approved
    article.reviewed_by = current_user.id
    article.review_note = None
    article.published_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(article)

    create_notification(
        db, article.volunteer_id, type="article_approved",
        title="তোমার আর্টিকেল প্রকাশিত হয়েছে",
        body=f'"{article.title}" এখন সবার জন্য প্রকাশিত হয়েছে।',
        related_type="article", related_id=article.id,
    )

    return to_article_out(article)


@router.patch("/{article_id}/reject", response_model=ArticleOut)
def reject_article(
    article_id: int,
    payload: ArticleReject,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """প্রত্যাখ্যান + ফিডব্যাক — doc: PATCH /director/articles/{id}/reject"""
    article = db.scalar(select(Article).where(Article.id == article_id))
    if not article:
        raise HTTPException(404, "আর্টিকেল পাওয়া যায়নি")
    if article.status != ArticleStatus.pending:
        raise HTTPException(400, "শুধু pending আর্টিকেলই প্রত্যাখ্যান করা যাবে")

    article.status = ArticleStatus.rejected
    article.reviewed_by = current_user.id
    article.review_note = payload.review_note

    db.commit()
    db.refresh(article)

    create_notification(
        db, article.volunteer_id, type="article_rejected",
        title="তোমার আর্টিকেল প্রত্যাখ্যাত হয়েছে",
        body=payload.review_note,
        related_type="article", related_id=article.id,
    )

    return to_article_out(article)