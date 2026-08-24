from pydantic import BaseModel


class VolunteerApprovalOut(BaseModel):
    user_id: int
    name: str
    phone: str
    status: str
    student_id_no: str | None
    institution_id: int | None
    semester: str | None
    service_upazila_id: int | None


class VolunteerRejectPayload(BaseModel):
    reason: str