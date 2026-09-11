from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.article import Article, ArticleStatus
from app.schemas.article import ArticlePublicOut
from app.services.article_service import to_article_public_out

router = APIRouter(prefix="/articles", tags=["Articles (Public)"])


@router.get("/{article_id}/related", response_model=list[ArticlePublicOut])
def related_articles(article_id: int, db: Session = Depends(get_db)):
    """একই category-র আরও ৩টা প্রকাশিত আর্টিকেল"""
    article = db.get(Article, article_id)
    if not article or not article.category_id:
        return []
    stmt = (
        select(Article)
        .where(Article.category_id == article.category_id, Article.id != article_id, Article.status == ArticleStatus.approved)
        .options(selectinload(Article.tags), selectinload(Article.album))
        .order_by(Article.published_at.desc())
        .limit(3)
    )
    return [to_article_public_out(a) for a in db.scalars(stmt).all()]