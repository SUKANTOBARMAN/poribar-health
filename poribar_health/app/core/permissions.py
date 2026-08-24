from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.database import get_db
from app.models.user import User, UserStatus

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.get(User, int(user_id))
    if user is None:
        raise credentials_exception
    if user.status != UserStatus.active:
        raise HTTPException(status_code=403, detail="Account not active")
    return user


def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    """
    টোকেন থাকলে user রিটার্ন করে, না থাকলে বা invalid হলে None রিটার্ন করে (error না দিয়ে)।
    ব্যবহার: public endpoint-এ যেখানে লগইন করা থাকলে বাড়তি তথ্য দেখানো হবে,
    না থাকলেও রিকোয়েস্ট ব্যর্থ হবে না — যেমন blood-donor-এর contact_visibility চেক।
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = db.get(User, int(user_id))
    if not user or user.status != UserStatus.active:
        return None
    return user


def require_role(*roles: str):
    """Usage: dependencies=[Depends(require_role('director', 'super_admin'))]"""

    def checker(current_user: User = Depends(get_current_user)) -> User:
        if not any(current_user.has_role(r) for r in roles):
            raise HTTPException(status_code=403, detail="Insufficient role")
        return current_user

    return checker


def require_permission(*permissions: str):
    """Usage: dependencies=[Depends(require_permission('article.approve'))]"""

    def checker(current_user: User = Depends(get_current_user)) -> User:
        if not any(current_user.has_permission(p) for p in permissions):
            raise HTTPException(status_code=403, detail="Insufficient permission")
        return current_user

    return checker