from pydantic import BaseModel, Field


class DivisionOut(BaseModel):
    id: int
    name_bn: str
    name_en: str

    model_config = {"from_attributes": True}


class DistrictOut(BaseModel):
    id: int
    division_id: int
    name_bn: str
    name_en: str

    model_config = {"from_attributes": True}


class UpazilaOut(BaseModel):
    id: int
    district_id: int
    name_bn: str
    name_en: str

    model_config = {"from_attributes": True}


class UnionOut(BaseModel):
    id: int
    upazila_id: int
    name_bn: str
    name_en: str

    class Config:
        from_attributes = True


class UpazilaCreate(BaseModel):
    district_id: int
    name_bn: str = Field(min_length=2, max_length=100)
    name_en: str = Field(min_length=2, max_length=100)