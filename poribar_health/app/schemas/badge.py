from datetime import datetime

from pydantic import BaseModel


class BadgeOut(BaseModel):
    id: int
    name: str
    name_bn: str
    icon: str | None
    criteria_type: str
    criteria_value: int
    description: str | None

    model_config = {"from_attributes": True}


class VolunteerBadgeOut(BaseModel):
    badge: BadgeOut
    awarded_at: datetime

    model_config = {"from_attributes": True}


class CertificateIssueRequest(BaseModel):
    volunteer_id: int
    type: str  # যেমন 'appreciation' | 'annual_service'


class CertificateOut(BaseModel):
    id: int
    volunteer_id: int
    type: str
    issued_at: datetime
    issued_by: int
    token: str

    model_config = {"from_attributes": True}