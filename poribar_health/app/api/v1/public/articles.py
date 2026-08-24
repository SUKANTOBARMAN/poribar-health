from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.article import Article, ArticleStatus
from app.schemas.article import ArticlePublicOut
from app.services.article_service import to_article_public_out

router = APIRouter(prefix="/articles", tags=["Articles (Public)"])


@router.get("", response_model=list[ArticlePublicOut])
def list_articles(
    type: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """প্রকাশিত আর্টিকেল — doc: GET /articles?type=&page="""
    stmt = (
        select(Article)
        .where(Article.status == ArticleStatus.approved)
        .options(selectinload(Article.tags))
        .order_by(Article.published_at.desc())
    )
    if type is not None:
        stmt = stmt.where(Article.type == type)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    articles = db.scalars(stmt).all()
    return [to_article_public_out(a) for a in articles]


@router.get("/{article_id}", response_model=ArticlePublicOut)
def get_article(article_id: int, db: Session = Depends(get_db)):
    """আর্টিকেলের বিস্তারিত — doc: GET /articles/{id}"""
    article = db.scalar(
        select(Article)
        .where(Article.id == article_id, Article.status == ArticleStatus.approved)
        .options(selectinload(Article.tags))
    )
    if not article:
        raise HTTPException(404, "আর্টিকেল পাওয়া যায়নি")
    return to_article_public_out(article)