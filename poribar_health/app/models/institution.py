import enum

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.mixins import TimestampMixin


class AccreditationStatus(str, enum.Enum):
    accredited = "accredited"
    pending = "pending"
    unaccredited = "unaccredited"


class InstitutionType(str, enum.Enum):
    nursing_college = "nursing_college"
    medical_college = "medical_college"
    university = "university"
    other = "other"


class Institution(Base, TimestampMixin):
    """doc DB Schema: nursing_institutions (id, upazila_id, name_bn, name_en, type, accreditation_status, address, contact_phone, created_at)"""

    __tablename__ = "institutions"

    id: Mapped[int] = mapped_column(primary_key=True)
    upazila_id: Mapped[int] = mapped_column(ForeignKey("upazilas.id"), nullable=False)
    name_bn: Mapped[str] = mapped_column(nullable=False)
    name_en: Mapped[str] = mapped_column(nullable=False)
    type: Mapped[InstitutionType] = mapped_column(nullable=False, default=InstitutionType.nursing_college)
    accreditation_status: Mapped[AccreditationStatus] = mapped_column(nullable=False, default=AccreditationStatus.pending)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=True)

    upazila: Mapped["Upazila"] = relationship()  # noqa: F821