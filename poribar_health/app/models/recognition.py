import enum
import uuid

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.mixins import TimestampMixin


class AwardStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class AwardNomination(Base, TimestampMixin):
    """doc: POST /director/awards/nominate — বিশেষ পুরস্কারের মনোনয়ন"""

    __tablename__ = "award_nominations"

    id: Mapped[int] = mapped_column(primary_key=True)
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    nominated_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    award_title: Mapped[str] = mapped_column(String(150), nullable=False)  # যেমন "Best Volunteer 2026"
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[AwardStatus] = mapped_column(nullable=False, default=AwardStatus.pending)
    decided_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    decided_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)

    volunteer: Mapped["User"] = relationship(foreign_keys=[volunteer_id])  # noqa: F821
    nominator: Mapped["User"] = relationship(foreign_keys=[nominated_by])  # noqa: F821
    decider: Mapped["User"] = relationship(foreign_keys=[decided_by])  # noqa: F821


class ReferenceLetter(Base):
    """
    doc M10: "Certificates + reference letter generator" — সার্টিফিকেটের (M7) থেকে আলাদা,
    এটা চাকরি/স্কলারশিপ আবেদনের জন্য আনুষ্ঠানিক reference letter।
    """

    __tablename__ = "reference_letters"

    id: Mapped[int] = mapped_column(primary_key=True)
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    issued_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    purpose: Mapped[str] = mapped_column(String(200), nullable=True)  # যেমন "চাকরির আবেদনের জন্য"
    issued_at: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    token: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid.uuid4()))

    volunteer: Mapped["User"] = relationship(foreign_keys=[volunteer_id])  # noqa: F821
    issuer: Mapped["User"] = relationship(foreign_keys=[issued_by])  # noqa: F821