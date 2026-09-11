import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.database import get_db
from app.models.password_reset import PasswordResetOTP
from app.models.user import User
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest

router = APIRouter(prefix="/auth", tags=["Password Reset"])


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    ফোন নম্বর দিলে ৬-সংখ্যার OTP SMS-এ পাঠানো হয়।
    Security: user না থাকলেও একই generic response দেওয়া হয়, phone enumeration আটকাতে।
    """
    user = db.scalar(select(User).where(User.phone == payload.phone))
    if user:
        otp = f"{random.randint(100000, 999999)}"
        print(f"\n✨ [DEV OTP DEBUG] Phone: {user.phone} ---> OTP CODE: {otp} ✨\n")
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        db.add(PasswordResetOTP(user_id=user.id, otp_hash=hash_password(otp), expires_at=expires_at))
        db.commit()

        from app.jobs.notification_tasks import send_sms_task
        try:
            send_sms_task.delay(user.phone, f"Poribar Health: আপনার পাসওয়ার্ড রিসেট OTP হলো {otp} (১০ মিনিট মেয়াদ)")
        except Exception:
            pass

    return {"status": "ok", "detail": "ফোন নম্বরটা নিবন্ধিত থাকলে OTP পাঠানো হয়েছে"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.phone == payload.phone))
    if not user:
        raise HTTPException(400, "ভুল ফোন নম্বর বা OTP")

    otp_record = db.scalar(
        select(PasswordResetOTP)
        .where(PasswordResetOTP.user_id == user.id, PasswordResetOTP.used.is_(False))
        .order_by(PasswordResetOTP.created_at.desc())
    )
    if not otp_record or otp_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(400, "OTP-এর মেয়াদ শেষ হয়ে গেছে, আবার চেষ্টা করো")
    if not verify_password(payload.otp, otp_record.otp_hash):
        raise HTTPException(400, "ভুল ফোন নম্বর বা OTP")

    user.password_hash = hash_password(payload.new_password)
    otp_record.used = True
    db.commit()
    return {"status": "ok"}