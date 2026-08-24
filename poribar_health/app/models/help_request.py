import enum

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.mixins import TimestampMixin


class HelpRequestType(str, enum.Enum):
    info = "info"
    serial = "serial"
    accommodation = "accommodation"
    ambulance = "ambulance"
    blood = "blood"
    emergency = "emergency"


class HelpRequestUrgency(str, enum.Enum):
    normal = "normal"
    urgent = "urgent"
    emergency = "emergency"


class HelpRequestStatus(str, enum.Enum):
    open = "open"
    accepted = "accepted"
    inprogress = "inprogress"
    resolved = "resolved"
    closed = "closed"


class HelpRequest(Base, TimestampMixin):
    __tablename__ = "help_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    upazila_id: Mapped[int] = mapped_column(ForeignKey("upazilas.id"), nullable=False)
    type: Mapped[HelpRequestType] = mapped_column(nullable=False)
    urgency: Mapped[HelpRequestUrgency] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[HelpRequestStatus] = mapped_column(
        nullable=False, default=HelpRequestStatus.open
    )

    # doc-এ ছিল না, কিন্তু "accept" workflow-এর জন্য দরকার — কে এই মুহূর্তে দায়িত্বে আছে সেটা ট্র্যাক করতে
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    patient_feedback: Mapped[int] = mapped_column(Integer, nullable=True)  # 1-5
    patient_feedback_text: Mapped[str] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])  # noqa: F821
    volunteer: Mapped["User"] = relationship(foreign_keys=[volunteer_id])  # noqa: F821
    upazila: Mapped["Upazila"] = relationship()  # noqa: F821
    assistance_logs: Mapped[list["AssistanceLog"]] = relationship(
        back_populates="help_request", cascade="all, delete-orphan"
    )


class AssistanceLog(Base, TimestampMixin):
    __tablename__ = "assistance_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    help_request_id: Mapped[int] = mapped_column(ForeignKey("help_requests.id"), nullable=False)
    action_taken: Mapped[str] = mapped_column(Text, nullable=False)
    outcome: Mapped[str] = mapped_column(Text, nullable=True)

    volunteer: Mapped["User"] = relationship()  # noqa: F821
    help_request: Mapped["HelpRequest"] = relationship(back_populates="assistance_logs")