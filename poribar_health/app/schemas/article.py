from datetime import datetime

from pydantic import BaseModel, Field
from app.schemas.content import AlbumItemInput
from app.schemas.content import AlbumImageOut

class ArticleCreate(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    body: str = ""
    category_id: int | None = None
    help_request_id: int | None = None
    patient_consent: bool = False
    patient_name_hidden: bool = True
    tags: list[str] = []
    album: list["AlbumItemInput"] = []


class ArticleUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    category_id: int | None = None
    patient_consent: bool | None = None
    patient_name_hidden: bool | None = None
    tags: list[str] | None = None
    album: list["AlbumItemInput"] | None = None
    submit_for_review: bool = False

class ArticleReject(BaseModel):
    review_note: str = Field(min_length=5)


class ArticleOut(BaseModel):
    id: int
    volunteer_id: int
    help_request_id: int | None
    title: str
    body: str
    patient_consent: bool
    patient_name_hidden: bool
    status: str
    reviewed_by: int | None
    review_note: str | None
    published_at: datetime | None
    created_at: datetime
    tags: list[str] = []
    category_id: int | None = None
    category_name: str | None = None
    author_name: str
    author_institution: str | None = None
    cover_media_id: int | None = None
    album_items: list["AlbumImageOut"] = []
    cover_caption: str | None = None

    model_config = {"from_attributes": True}


class ArticlePublicOut(BaseModel):
    id: int
    title: str
    body: str
    published_at: datetime | None
    tags: list[str] = []
    category_name: str | None = None
    author_name: str
    author_institution: str | None = None
    cover_media_id: int | None = None
    album_items: list["AlbumImageOut"] = []
    cover_caption: str | None = None
    

    model_config = {"from_attributes": True}

class ArticleApprove(BaseModel):
    note: str | None = None