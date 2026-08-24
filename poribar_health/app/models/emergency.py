import enum

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.mixins import TimestampMixin


class VehicleOwnerType(str, enum.Enum):
    govt = "govt"
    private = "private"
    ngo = "ngo"


class BloodGroup(str, enum.Enum):
    a_pos = "A+"
    a_neg = "A-"
    b_pos = "B+"
    b_neg = "B-"
    ab_pos = "AB+"
    ab_neg = "AB-"
    o_pos = "O+"
    o_neg = "O-"


class ContactVisibility(str, enum.Enum):
    volunteers_only = "volunteers_only"
    public = "public"


class Ambulance(Base):
    __tablename__ = "ambulances"

    id: Mapped[int] = mapped_column(primary_key=True)
    upazila_id: Mapped[int] = mapped_column(ForeignKey("upazilas.id"), nullable=False)
    driver_name: Mapped[str] = mapped_column(nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    type: Mapped[VehicleOwnerType] = mapped_column(nullable=False)
    availability_status: Mapped[bool] = mapped_column(Boolean, default=True)
    fare_per_km: Mapped[float] = mapped_column(Numeric(8, 2), nullable=True)
    ac_available: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    upazila: Mapped["Upazila"] = relationship()  # noqa: F821


class BloodDonor(Base, TimestampMixin):
    __tablename__ = "blood_donors"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    blood_group: Mapped[BloodGroup] = mapped_column(nullable=False, index=True)
    upazila_id: Mapped[int] = mapped_column(ForeignKey("upazilas.id"), nullable=False, index=True)
    last_donated_at: Mapped[Date] = mapped_column(Date, nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    contact_visibility: Mapped[ContactVisibility] = mapped_column(
        nullable=False, default=ContactVisibility.volunteers_only
    )

    user: Mapped["User"] = relationship()  # noqa: F821
    upazila: Mapped["Upazila"] = relationship()  # noqa: F821