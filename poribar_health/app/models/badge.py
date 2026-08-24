import uuid

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.mixins import TimestampMixin


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)  # ইংরেজি নাম (Silver Helper)
    name_bn: Mapped[str] = mapped_column(nullable=False)  # বাংলা নাম (নতুন সাথী)
    icon: Mapped[str] = mapped_column(nullable=True)  # icon identifier/URL
    criteria_type: Mapped[str] = mapped_column(nullable=False)  # যেমন 'assistance_count'
    criteria_value: Mapped[int] = mapped_column(Integer, nullable=False)  # থ্রেশহোল্ড সংখ্যা
    description: Mapped[str] = mapped_column(nullable=True)


class VolunteerBadge(Base):
    __tablename__ = "volunteer_badges"

    id: Mapped[int] = mapped_column(primary_key=True)
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    badge_id: Mapped[int] = mapped_column(ForeignKey("badges.id"), nullable=False)
    awarded_at: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    awarded_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)  # null হলে system auto-award

    volunteer: Mapped["User"] = relationship(foreign_keys=[volunteer_id])  # noqa: F821
    badge: Mapped["Badge"] = relationship()
    awarder: Mapped["User"] = relationship(foreign_keys=[awarded_by])  # noqa: F821


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(primary_key=True)
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    type: Mapped[str] = mapped_column(nullable=False)  # যেমন 'appreciation', 'annual_service'
    issued_at: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    issued_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    token: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid.uuid4()))

    volunteer: Mapped["User"] = relationship(foreign_keys=[volunteer_id])  # noqa: F821
    issuer: Mapped["User"] = relationship(foreign_keys=[issued_by])  # noqa: F821