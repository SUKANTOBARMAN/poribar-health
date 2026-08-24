from pydantic import BaseModel, Field


class SymptomOut(BaseModel):
    id: int
    name_bn: str
    name_en: str
    common_name_bn: str | None

    model_config = {"from_attributes": True}


class SpecialtyOut(BaseModel):
    id: int
    name_bn: str
    name_en: str

    model_config = {"from_attributes": True}


class SymptomCheckRequest(BaseModel):
    symptom_ids: list[int] = Field(min_length=1)


class SpecialtySuggestion(BaseModel):
    specialty: SpecialtyOut
    score: int  # মোট weight — যত বেশি, তত বেশি সম্ভাবনা এই বিভাগেই যাওয়া উচিত


class SymptomCheckResponse(BaseModel):
    suggestions: list[SpecialtySuggestion]