from datetime import datetime

from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    body: str | None
    is_read: bool
    related_type: str | None
    related_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}