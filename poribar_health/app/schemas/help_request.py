from datetime import datetime

from pydantic import BaseModel, Field


class HelpRequestCreate(BaseModel):
    upazila_id: int
    type: str  # info | serial | accommodation | ambulance | blood | emergency
    urgency: str  # normal | urgent | emergency
    description: str = Field(min_length=5)


class HelpRequestOut(BaseModel):
    id: int
    user_id: int
    upazila_id: int
    volunteer_id: int | None
    type: str
    urgency: str
    description: str
    status: str
    patient_feedback: int | None
    patient_feedback_text: str | None
    created_at: datetime
    resolved_at: datetime | None

    model_config = {"from_attributes": True}


class HelpRequestFeedback(BaseModel):
    patient_feedback: int = Field(ge=1, le=5)
    patient_feedback_text: str | None = None


class HelpRequestVolunteerUpdate(BaseModel):
    """ভলান্টিয়ার status বদলাবে + কী action নিয়েছে সেটা log করবে (doc: PATCH /volunteer/requests/{id}/update)"""

    status: str  # accepted | inprogress | resolved | closed
    action_taken: str = Field(min_length=3)
    outcome: str | None = None


class AssistanceLogOut(BaseModel):
    id: int
    help_request_id: int
    action_taken: str
    outcome: str | None
    created_at: datetime

    model_config = {"from_attributes": True}