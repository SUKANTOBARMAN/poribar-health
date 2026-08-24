from pydantic import BaseModel


class InstitutionOut(BaseModel):
    id: int
    upazila_id: int
    name_bn: str
    name_en: str
    type: str
    accreditation_status: str

    model_config = {"from_attributes": True}