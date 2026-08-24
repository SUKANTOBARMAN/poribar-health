from datetime import datetime

from pydantic import BaseModel, Field


class ArticleCreate(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    body: str = Field(min_length=20)
    type: str  # success_story | health_info | area_report
    help_request_id: int | None = None
    patient_consent: bool = False
    patient_name_hidden: bool = True
    tags: list[str] = []


class ArticleUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    type: str | None = None
    patient_consent: bool | None = None
    patient_name_hidden: bool | None = None
    tags: list[str] | None = None
    submit_for_review: bool = False  # True হলে draft -> pending status বদলাবে


class ArticleReject(BaseModel):
    review_note: str = Field(min_length=5)


class ArticleOut(BaseModel):
    id: int
    volunteer_id: int
    help_request_id: int | None
    title: str
    body: str
    type: str
    patient_consent: bool
    patient_name_hidden: bool
    status: str
    reviewed_by: int | None
    review_note: str | None
    published_at: datetime | None
    created_at: datetime
    tags: list[str] = []

    model_config = {"from_attributes": True}


class ArticlePublicOut(BaseModel):
    """প্রকাশিত (approved) আর্টিকেলের জন্য — internal review fields বাদ দিয়ে।"""

    id: int
    title: str
    body: str
    type: str
    published_at: datetime | None
    tags: list[str] = []

    model_config = {"from_attributes": True}