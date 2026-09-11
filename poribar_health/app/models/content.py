from sqlalchemy import Boolean, ForeignKey, Integer, String, Table, Column, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.mixins import TimestampMixin


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name_bn: Mapped[str] = mapped_column(nullable=False)
    name_en: Mapped[str] = mapped_column(nullable=False)
    parent_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=True)

    parent: Mapped["Category"] = relationship(remote_side=[id], back_populates="children")
    children: Mapped[list["Category"]] = relationship(back_populates="parent")


class MediaFile(Base, TimestampMixin):
    __tablename__ = "media_files"

    id: Mapped[int] = mapped_column(primary_key=True)
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    file_path: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(50), nullable=False)

    uploader: Mapped["User"] = relationship()  # noqa: F821


class ArticleMedia(Base):
    """Album entry — order, caption, cover flag সহ (আগে শুধু plain association table ছিল)"""

    __tablename__ = "article_media"

    id: Mapped[int] = mapped_column(primary_key=True)
    article_id: Mapped[int] = mapped_column(ForeignKey("articles.id"), nullable=False)
    media_id: Mapped[int] = mapped_column(ForeignKey("media_files.id"), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    caption: Mapped[str] = mapped_column(Text, nullable=True)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False)

    media: Mapped["MediaFile"] = relationship()