from collections.abc import Generator

from sqlalchemy import String, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=settings.DEBUG)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    # MySQL requires an explicit length on VARCHAR columns (SQLite/Postgres don't).
    # This makes every plain `Mapped[str]` default to VARCHAR(255) unless a column
    # explicitly overrides it with mapped_column(String(n)) or Text().
    type_annotation_map = {
        str: String(255),
    }


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()