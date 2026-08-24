from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.article import Article, ArticleStatus, ArticleTag
from app.models.user import User
from app.schemas.article import ArticleCreate, ArticleOut, ArticleUpdate
from app.services.article_service import to_article_out

router = APIRouter(
    prefix="/volunteer/articles",
    tags=["Articles (Volunteer)"],
    dependencies=[Depends(require_role("volunteer"))],
)


@router.post("", response_model=ArticleOut, status_code=201)
def create_article(
    payload: ArticleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """নতুন আর্টিকেল ড্রাফট — doc: POST /volunteer/articles"""
    article = Article(
        volunteer_id=current_user.id,
        help_request_id=payload.help_request_id,
        title=payload.title,
        body=payload.body,
        type=payload.type,
        patient_consent=payload.patient_consent,
        patient_name_hidden=payload.patient_name_hidden,
        status=ArticleStatus.draft,
    )
    for tag in payload.tags:
        article.tags.append(ArticleTag(tag=tag))

    db.add(article)
    db.commit()
    db.refresh(article)
    return to_article_out(article)


@router.get("", response_model=list[ArticleOut])
def my_articles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """আমার সকল আর্টিকেল — doc: GET /volunteer/articles"""
    stmt = (
        select(Article)
        .where(Article.volunteer_id == current_user.id)
        .options(selectinload(Article.tags))
        .order_by(Article.created_at.desc())
    )
    articles = db.scalars(stmt).all()
    return [to_article_out(a) for a in articles]


@router.patch("/{article_id}", response_model=ArticleOut)
def update_article(
    article_id: int,
    payload: ArticleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """আর্টিকেল সম্পাদনা — doc: PATCH /volunteer/articles/{id}"""
    article = db.scalar(select(Article).where(Article.id == article_id))
    if not article:
        raise HTTPException(404, "আর্টিকেল পাওয়া যায়নি")
    if article.volunteer_id != current_user.id:
        raise HTTPException(403, "শুধু নিজের আর্টিকেলই সম্পাদনা করা যাবে")
    if article.status not in (ArticleStatus.draft, ArticleStatus.rejected):
        raise HTTPException(400, "শুধু draft অথবা rejected আর্টিকেল সম্পাদনা করা যাবে")

    update_data = payload.model_dump(exclude_unset=True, exclude={"tags", "submit_for_review"})
    for field, value in update_data.items():
        setattr(article, field, value)

    if payload.tags is not None:
        article.tags.clear()
        for tag in payload.tags:
            article.tags.append(ArticleTag(tag=tag))

    if payload.submit_for_review:
        article.status = ArticleStatus.pending
        article.review_note = None
        article.reviewed_by = None

    db.commit()
    db.refresh(article)
    return to_article_out(article)