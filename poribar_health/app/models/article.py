import enum

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.mixins import TimestampMixin


class ArticleType(str, enum.Enum):
    success_story = "success_story"
    health_info = "health_info"
    area_report = "area_report"


class ArticleStatus(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Article(Base, TimestampMixin):
    __tablename__ = "articles"
    __table_args__ = (
        # doc: FULLTEXT INDEX: title, body — বাংলা/ইংরেজি টেক্সট সার্চের জন্য
        Index("ix_articles_fulltext", "title", "body", mysql_prefix="FULLTEXT"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    help_request_id: Mapped[int] = mapped_column(ForeignKey("help_requests.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)  # LONGTEXT-এর বদলে Text (MySQL এ যথেষ্ট বড়)
    type: Mapped[ArticleType] = mapped_column(nullable=False)
    patient_consent: Mapped[bool] = mapped_column(Boolean, default=False)
    patient_name_hidden: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[ArticleStatus] = mapped_column(nullable=False, default=ArticleStatus.draft)
    reviewed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    review_note: Mapped[str] = mapped_column(Text, nullable=True)
    published_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)

    volunteer: Mapped["User"] = relationship(foreign_keys=[volunteer_id])  # noqa: F821
    reviewer: Mapped["User"] = relationship(foreign_keys=[reviewed_by])  # noqa: F821
    tags: Mapped[list["ArticleTag"]] = relationship(
        back_populates="article", cascade="all, delete-orphan"
    )


class ArticleTag(Base):
    __tablename__ = "article_tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    article_id: Mapped[int] = mapped_column(ForeignKey("articles.id"), nullable=False)
    tag: Mapped[str] = mapped_column(String(50), nullable=False)

    article: Mapped["Article"] = relationship(back_populates="tags")