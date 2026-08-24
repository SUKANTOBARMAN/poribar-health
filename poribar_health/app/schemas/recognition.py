from datetime import datetime

from pydantic import BaseModel, Field


class AwardNominateRequest(BaseModel):
    volunteer_id: int
    award_title: str = Field(min_length=3, max_length=150)
    reason: str = Field(min_length=10)


class AwardNominationOut(BaseModel):
    id: int
    volunteer_id: int
    nominated_by: int
    award_title: str
    reason: str
    status: str
    decided_by: int | None
    decided_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AwardDecisionRequest(BaseModel):
    approve: bool
    note: str | None = None


class ReferenceLetterIssueRequest(BaseModel):
    volunteer_id: int
    purpose: str | None = None


class ReferenceLetterOut(BaseModel):
    id: int
    volunteer_id: int
    issued_by: int
    purpose: str | None
    issued_at: datetime
    token: str

    model_config = {"from_attributes": True}