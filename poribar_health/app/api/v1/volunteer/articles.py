import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.article import Article, ArticleStatus, ArticleTag
from app.models.content import ArticleMedia
from app.models.user import User
from app.schemas.article import ArticleCreate, ArticleOut, ArticleUpdate
from app.services.article_service import to_article_out

router = APIRouter(
    prefix="/volunteer/articles",
    tags=["Articles (Volunteer)"],
    dependencies=[Depends(require_role("volunteer"))],
)


def _plain_text_length(html: str) -> int:
    text = re.sub(r"<[^>]+>", "", html or "")
    return len(text.strip())


def _sync_album(db: Session, article_id: int, album_items) -> None:
    """
    পুরনো সব album entry মুছে, frontend থেকে যা এসেছে ঠিক তাই দিয়ে replace করে।
    সংখ্যা ছোট (৪-৬টা ছবি) বলে diff করার দরকার নেই — এটাই সবচেয়ে সহজ ও নির্ভরযোগ্য।
    """
    db.query(ArticleMedia).filter(ArticleMedia.article_id == article_id).delete()
    for i, item in enumerate(album_items):
        db.add(ArticleMedia(
            article_id=article_id,
            media_id=item.media_id,
            caption=item.caption,
            order_index=i,
            is_cover=item.is_cover,
        ))


@router.post("", response_model=ArticleOut, status_code=201)
def create_article(
    payload: ArticleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    'সেভ করো' বাটনে ক্লিক করলেই কেবল এই endpoint কল হয় —
    article, tags, আর পুরো album একটাই request-এ, একসাথে DB-তে যায়। কোনো auto-draft নেই।
    """
    article = Article(
        volunteer_id=current_user.id,
        title=payload.title,
        body=payload.body,
        category_id=payload.category_id,
        patient_consent=payload.patient_consent,
        patient_name_hidden=payload.patient_name_hidden,
        status=ArticleStatus.draft,
    )
    db.add(article)
    db.flush()

    for tag in payload.tags:
        article.tags.append(ArticleTag(tag=tag))
    _sync_album(db, article.id, payload.album)

    db.commit()
    db.refresh(article)
    return to_article_out(article)


@router.get("", response_model=list[ArticleOut])
def my_articles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(Article).where(Article.volunteer_id == current_user.id).order_by(Article.created_at.desc())
    return [to_article_out(a) for a in db.scalars(stmt).all()]


@router.get("/{article_id}", response_model=ArticleOut)
def get_my_article(article_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    article = db.scalar(select(Article).where(Article.id == article_id, Article.volunteer_id == current_user.id))
    if not article:
        raise HTTPException(404, "আর্টিকেল পাওয়া যায়নি")
    return to_article_out(article)


@router.patch("/{article_id}", response_model=ArticleOut)
def update_article(
    article_id: int,
    payload: ArticleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    article = db.scalar(select(Article).where(Article.id == article_id))
    if not article:
        raise HTTPException(404, "আর্টিকেল পাওয়া যায়নি")
    if article.volunteer_id != current_user.id:
        raise HTTPException(403, "শুধু নিজের আর্টিকেলই সম্পাদনা করা যাবে")
    if article.status not in (ArticleStatus.draft, ArticleStatus.rejected, ArticleStatus.pending, ArticleStatus.approved):
        raise HTTPException(400, "শুধু draft অথবা rejected আর্টিকেল সম্পাদনা করা যাবে")

    update_data = payload.model_dump(exclude_unset=True, exclude={"tags", "album", "submit_for_review"})
    for field, value in update_data.items():
        setattr(article, field, value)

    if payload.tags is not None:
        article.tags.clear()
        for tag in payload.tags:
            article.tags.append(ArticleTag(tag=tag))

    if payload.album is not None:
        _sync_album(db, article.id, payload.album)

    if payload.submit_for_review:
        if _plain_text_length(article.body) < 20:
            raise HTTPException(400, "জমা দেওয়ার আগে কমপক্ষে ২০ ক্যারেক্টার লিখতে হবে")
        article.status = ArticleStatus.pending
        article.review_note = None
        article.reviewed_by = None

    db.commit()
    db.refresh(article)
    return to_article_out(article)


@router.delete("/{article_id}", status_code=204)
def delete_article(article_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    article = db.scalar(select(Article).where(Article.id == article_id))
    if not article:
        raise HTTPException(404, "আর্টিকেল পাওয়া যায়নি")
    if article.volunteer_id != current_user.id:
        raise HTTPException(403, "শুধু নিজের আর্টিকেলই মুছতে পারবে")
    db.delete(article)
    db.commit()