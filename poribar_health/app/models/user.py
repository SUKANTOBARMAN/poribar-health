import enum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.mixins import TimestampMixin
from app.models.rbac import Role, user_roles


class UserStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    suspended = "suspended"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(String(200), unique=True, nullable=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    avatar: Mapped[str] = mapped_column(nullable=True)

    division_id: Mapped[int] = mapped_column(ForeignKey("divisions.id"), nullable=True)
    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id"), nullable=True)
    upazila_id: Mapped[int] = mapped_column(ForeignKey("upazilas.id"), nullable=True)

    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus), default=UserStatus.pending, nullable=False
    )

    roles: Mapped[list["Role"]] = relationship(secondary=user_roles, back_populates="users")
    volunteer_profile: Mapped["VolunteerProfile"] = relationship(
        back_populates="user", uselist=False, foreign_keys="VolunteerProfile.user_id"
    )

    def has_role(self, role_name: str) -> bool:
        return any(r.name == role_name for r in self.roles)

    def has_permission(self, permission_name: str) -> bool:
        return any(p.name == permission_name for r in self.roles for p in r.permissions)


class VolunteerProfile(Base):
    __tablename__ = "volunteer_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    student_id_no: Mapped[str] = mapped_column(nullable=True)
    institution_id: Mapped[int] = mapped_column(ForeignKey("institutions.id"), nullable=True)
    semester: Mapped[str] = mapped_column(nullable=True)
    nid_encrypted: Mapped[str] = mapped_column(nullable=True)
    student_id_doc: Mapped[str] = mapped_column(nullable=True)  # file path
    service_upazila_id: Mapped[int] = mapped_column(ForeignKey("upazilas.id"), nullable=True)
    verified_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    verified_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    public_slug: Mapped[str] = mapped_column(unique=True, nullable=True)

    # Phase 2 (M11) trust fields — included now so schema matches full roadmap
    nid_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    student_id_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    trust_score: Mapped[int] = mapped_column(default=0)
    flagged_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    flagged_reason: Mapped[str] = mapped_column(nullable=True)

    user: Mapped["User"] = relationship(back_populates="volunteer_profile", foreign_keys=[user_id])
