from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.mixins import TimestampMixin


class Division(Base, TimestampMixin):
    __tablename__ = "divisions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name_bn: Mapped[str] = mapped_column(nullable=False, unique=True)
    name_en: Mapped[str] = mapped_column(nullable=False, unique=True, index=True)

    districts: Mapped[list["District"]] = relationship(
        back_populates="division", cascade="all, delete-orphan"
    )


class District(Base, TimestampMixin):
    __tablename__ = "districts"
    __table_args__ = (
        UniqueConstraint("division_id", "name_en", name="uq_district_division_name_en"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    division_id: Mapped[int] = mapped_column(
        ForeignKey("divisions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name_bn: Mapped[str] = mapped_column(nullable=False)
    name_en: Mapped[str] = mapped_column(nullable=False, index=True)

    division: Mapped["Division"] = relationship(back_populates="districts")
    upazilas: Mapped[list["Upazila"]] = relationship(
        back_populates="district", cascade="all, delete-orphan"
    )


class Upazila(Base, TimestampMixin):
    __tablename__ = "upazilas"
    __table_args__ = (
        UniqueConstraint("district_id", "name_en", name="uq_upazila_district_name_en"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    district_id: Mapped[int] = mapped_column(
        ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name_bn: Mapped[str] = mapped_column(nullable=False)
    name_en: Mapped[str] = mapped_column(nullable=False, index=True)

    district: Mapped["District"] = relationship(back_populates="upazilas")
    unions: Mapped[list["Union"]] = relationship(
        back_populates="upazila", cascade="all, delete-orphan"
    )


class Union(Base, TimestampMixin):
    __tablename__ = "unions"
    __table_args__ = (
        UniqueConstraint("upazila_id", "name_en", name="uq_union_upazila_name_en"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    upazila_id: Mapped[int] = mapped_column(
        ForeignKey("upazilas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name_bn: Mapped[str] = mapped_column(nullable=False)
    name_en: Mapped[str] = mapped_column(nullable=False)

    upazila: Mapped["Upazila"] = relationship(back_populates="unions")