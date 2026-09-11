from pydantic import BaseModel, Field


class DoctorOut(BaseModel):
    id: int
    name: str
    designation: str | None
    opd_schedule: dict | None
    contact: str | None

    model_config = {"from_attributes": True}


class DepartmentOut(BaseModel):
    id: int
    name_bn: str
    name_en: str
    opd_days: str | None
    opd_time_start: str | None
    opd_time_end: str | None
    doctors: list[DoctorOut] = []

    model_config = {"from_attributes": True}


class HospitalListOut(BaseModel):
    """Lightweight version for list endpoints (no nested departments)."""

    id: int
    upazila_id: int
    name_bn: str
    name_en: str
    type: str
    bed_count: int | None
    emergency_available: bool
    contact_phone: str | None

    model_config = {"from_attributes": True}


class HospitalDetailOut(HospitalListOut):
    """Full detail — হাসপাতালের বিস্তারিত + বিভাগ + ডাক্তার (doc অনুযায়ী)."""

    address: str | None
    lat: float | None
    lng: float | None
    departments: list[DepartmentOut] = []

    model_config = {"from_attributes": True}


class HospitalCreate(BaseModel):
    upazila_id: int
    name_bn: str = Field(min_length=2, max_length=200)
    name_en: str = Field(min_length=2, max_length=200)
    type: str  # govt | private | ngo
    bed_count: int | None = None
    emergency_available: bool = False
    contact_phone: str | None = None
    address: str | None = None
    lat: float | None = None
    lng: float | None = None


class HospitalUpdate(BaseModel):
    name_bn: str | None = None
    name_en: str | None = None
    type: str | None = None
    bed_count: int | None = None
    emergency_available: bool | None = None
    contact_phone: str | None = None
    address: str | None = None
    lat: float | None = None
    lng: float | None = None
    

class DepartmentCreate(BaseModel):
    name_bn: str = Field(min_length=2, max_length=150)
    name_en: str = Field(min_length=2, max_length=150)
    opd_days: str | None = None
    opd_time_start: str | None = None
    opd_time_end: str | None = None


class DepartmentUpdate(BaseModel):
    name_bn: str | None = None
    name_en: str | None = None
    opd_days: str | None = None
    opd_time_start: str | None = None
    opd_time_end: str | None = None


class DoctorCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    designation: str | None = None
    contact: str | None = None
    opd_schedule: dict | None = None


class DoctorUpdate(BaseModel):
    name: str | None = None
    designation: str | None = None
    contact: str | None = None
    opd_schedule: dict | None = None