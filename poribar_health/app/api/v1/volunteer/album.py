from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.article import Article
from app.models.content import ArticleMedia, MediaFile
from app.models.user import User
from app.schemas.content import AlbumImageOut


class AlbumAddRequest(BaseModel):
    media_id: int
    caption: str | None = None


class AlbumUpdateRequest(BaseModel):
    caption: str | None = None
    order_index: int | None = None
    is_cover: bool | None = None


router = APIRouter(
    tags=["Article Album (Volunteer)"],
    dependencies=[Depends(require_role("volunteer"))],
)


def _check_ownership(db: Session, article_id: int, current_user: User) -> Article:
    article = db.get(Article, article_id)
    if not article:
        raise HTTPException(404, "আর্টিকেল পাওয়া যায়নি")
    if article.volunteer_id != current_user.id:
        raise HTTPException(403, "শুধু নিজের আর্টিকেলের album সম্পাদনা করা যাবে")
    return article


@router.get("/volunteer/articles/{article_id}/album", response_model=list[AlbumImageOut])
def get_album(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_ownership(db, article_id, current_user)
    stmt = select(ArticleMedia).where(ArticleMedia.article_id == article_id).order_by(ArticleMedia.order_index)
    return db.scalars(stmt).all()


@router.post("/volunteer/articles/{article_id}/album", response_model=AlbumImageOut, status_code=201)
def add_to_album(article_id: int, payload: AlbumAddRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _check_ownership(db, article_id, current_user)
    media = db.get(MediaFile, payload.media_id)
    if not media:
        raise HTTPException(404, "ছবি পাওয়া যায়নি")

    max_order = db.scalar(select(func.max(ArticleMedia.order_index)).where(ArticleMedia.article_id == article_id)) or 0
    existing_count = db.scalar(select(func.count(ArticleMedia.id)).where(ArticleMedia.article_id == article_id)) or 0

    item = ArticleMedia(
        article_id=article_id,
        media_id=payload.media_id,
        caption=payload.caption,
        order_index=max_order + 1,
        is_cover=(existing_count == 0),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/volunteer/album/{album_image_id}", response_model=AlbumImageOut)
def update_album_image(album_image_id: int, payload: AlbumUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(ArticleMedia, album_image_id)
    if not item:
        raise HTTPException(404, "পাওয়া যায়নি")
    _check_ownership(db, item.article_id, current_user)

    if payload.is_cover:
        others = db.scalars(select(ArticleMedia).where(ArticleMedia.article_id == item.article_id, ArticleMedia.id != album_image_id)).all()
        for o in others:
            o.is_cover = False

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/volunteer/album/{album_image_id}", status_code=204)
def remove_from_album(album_image_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.get(ArticleMedia, album_image_id)
    if not item:
        raise HTTPException(404, "পাওয়া যায়নি")
    _check_ownership(db, item.article_id, current_user)
    db.delete(item)
    db.commit()