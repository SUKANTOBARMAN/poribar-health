import enum

from sqlalchemy import JSON, Boolean, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.mixins import TimestampMixin


class HospitalType(str, enum.Enum):
    govt = "govt"
    private = "private"
    ngo = "ngo"


class Hospital(Base, TimestampMixin):
    __tablename__ = "hospitals"

    id: Mapped[int] = mapped_column(primary_key=True)
    upazila_id: Mapped[int] = mapped_column(ForeignKey("upazilas.id"), nullable=False)
    name_bn: Mapped[str] = mapped_column(nullable=False)
    name_en: Mapped[str] = mapped_column(nullable=False)
    type: Mapped[HospitalType] = mapped_column(Enum(HospitalType), nullable=False)
    bed_count: Mapped[int] = mapped_column(nullable=True)
    emergency_available: Mapped[bool] = mapped_column(Boolean, default=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    lat: Mapped[float] = mapped_column(Numeric(10, 7), nullable=True)
    lng: Mapped[float] = mapped_column(Numeric(10, 7), nullable=True)
    last_verified_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    last_verified_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    data_accuracy_score: Mapped[int] = mapped_column(default=100)

    upazila: Mapped["Upazila"] = relationship()
    departments: Mapped[list["Department"]] = relationship(
        back_populates="hospital", cascade="all, delete-orphan"
    )


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), nullable=False)
    name_bn: Mapped[str] = mapped_column(nullable=False)
    name_en: Mapped[str] = mapped_column(nullable=False)
    opd_days: Mapped[str] = mapped_column(nullable=True)
    opd_time_start: Mapped[str] = mapped_column(nullable=True)
    opd_time_end: Mapped[str] = mapped_column(nullable=True)

    hospital: Mapped["Hospital"] = relationship(back_populates="departments")
    doctors: Mapped[list["Doctor"]] = relationship(
        back_populates="department", cascade="all, delete-orphan"
    )


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(primary_key=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    designation: Mapped[str] = mapped_column(nullable=True)
    opd_schedule: Mapped[dict] = mapped_column(JSON, nullable=True)
    contact: Mapped[str] = mapped_column(String(20), nullable=True)

    department: Mapped["Department"] = relationship(back_populates="doctors")