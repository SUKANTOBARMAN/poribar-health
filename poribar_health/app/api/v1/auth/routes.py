from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.crypto import encrypt_field
from app.core.permissions import get_current_user
from app.core.rate_limit import limiter
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.database import get_db
from app.models.rbac import Role
from app.models.user import User, UserStatus, VolunteerProfile
from app.schemas.auth import LoginRequest, TokenResponse, UserOut, UserRegister, VolunteerRegister

router = APIRouter(prefix="/auth", tags=["Auth"])


def _get_role(db: Session, name: str) -> Role:
    role = db.scalar(select(Role).where(Role.name == name))
    if role is None:
        role = Role(name=name)
        db.add(role)
        db.flush()
    return role


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.phone == payload.phone)):
        raise HTTPException(400, "এই ফোন নম্বর দিয়ে ইতিমধ্যে একাউন্ট আছে")

    user = User(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        password_hash=hash_password(payload.password),
        division_id=payload.division_id,
        district_id=payload.district_id,
        upazila_id=payload.upazila_id,
        status=UserStatus.active,
    )
    user.roles.append(_get_role(db, "user"))
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut(
        id=user.id, name=user.name, phone=user.phone, email=user.email,
        status=user.status.value, roles=[r.name for r in user.roles],
    )


@router.post("/volunteer/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_volunteer(payload: VolunteerRegister, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.phone == payload.phone)):
        raise HTTPException(400, "এই ফোন নম্বর দিয়ে ইতিমধ্যে একাউন্ট আছে")

    user = User(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        password_hash=hash_password(payload.password),
        division_id=payload.division_id,
        district_id=payload.district_id,
        upazila_id=payload.service_upazila_id,
        status=UserStatus.pending,
    )
    user.roles.append(_get_role(db, "volunteer"))
    db.add(user)
    db.flush()

    profile = VolunteerProfile(
        user_id=user.id,
        student_id_no=payload.student_id_no,
        institution_id=payload.institution_id,
        semester=payload.semester,
        service_upazila_id=payload.service_upazila_id,
        nid_encrypted=encrypt_field(payload.nid),
        public_slug=f"vol-{user.id}",
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return UserOut(
        id=user.id, name=user.name, phone=user.phone, email=user.email,
        status=user.status.value, roles=[r.name for r in user.roles],
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.phone == form_data.username))
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(401, "ফোন নম্বর অথবা পাসওয়ার্ড ভুল")
    if user.status != UserStatus.active:
        raise HTTPException(403, "একাউন্ট এখনো সক্রিয় হয়নি (pending/suspended)")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    from app.core.security import decode_token

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid refresh token")
    user = db.get(User, int(payload["sub"]))
    if not user:
        raise HTTPException(401, "User not found")
    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id, name=current_user.name, phone=current_user.phone,
        email=current_user.email, status=current_user.status.value,
        roles=[r.name for r in current_user.roles],
    )