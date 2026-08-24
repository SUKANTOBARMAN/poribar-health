from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Specialty(Base):
    __tablename__ = "specialties"

    id: Mapped[int] = mapped_column(primary_key=True)
    name_bn: Mapped[str] = mapped_column(nullable=False)
    name_en: Mapped[str] = mapped_column(nullable=False)


class Symptom(Base):
    __tablename__ = "symptoms"

    id: Mapped[int] = mapped_column(primary_key=True)
    name_bn: Mapped[str] = mapped_column(nullable=False)
    name_en: Mapped[str] = mapped_column(nullable=False)
    common_name_bn: Mapped[str] = mapped_column(nullable=True)  # মানুষ যেভাবে বলে (কথ্য ভাষা)


class SymptomSpecialty(Base):
    """লক্ষণ-বিভাগ ম্যাপিং, weight দিয়ে বোঝায় কতটা সম্পর্কিত (doc অনুযায়ী)."""

    __tablename__ = "symptom_specialties"

    id: Mapped[int] = mapped_column(primary_key=True)
    symptom_id: Mapped[int] = mapped_column(ForeignKey("symptoms.id"), nullable=False)
    specialty_id: Mapped[int] = mapped_column(ForeignKey("specialties.id"), nullable=False)
    weight: Mapped[int] = mapped_column(nullable=False, default=1)

    symptom: Mapped["Symptom"] = relationship()
    specialty: Mapped["Specialty"] = relationship()