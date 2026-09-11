from datetime import date, datetime

from pydantic import BaseModel, Field


class AmbulanceOut(BaseModel):
    id: int
    upazila_id: int
    driver_name: str
    contact_phone: str
    type: str
    availability_status: bool
    fare_per_km: float | None
    ac_available: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


class BloodDonorPublicOut(BaseModel):
    """
    সাধারণ (anonymous) ভিজিটরের জন্য — contact_visibility অনুযায়ী ফোন নম্বর দেখাবে/লুকাবে।
    """

    id: int
    blood_group: str
    upazila_id: int
    last_donated_at: date | None
    is_available: bool
    contact_phone: str | None  # শুধু contact_visibility='public' হলে দেখাবে, নাহলে null

    model_config = {"from_attributes": True}


class BloodDonorRegister(BaseModel):
    blood_group: str  # A+ | A- | B+ | B- | AB+ | AB- | O+ | O-
    upazila_id: int
    last_donated_at: date | None = None
    contact_visibility: str = "volunteers_only"  # volunteers_only | public


class BloodDonorOut(BaseModel):
    id: int
    user_id: int
    blood_group: str
    upazila_id: int
    last_donated_at: date | None
    is_available: bool
    contact_visibility: str

    model_config = {"from_attributes": True}
    
class BloodDonorSelfUpdate(BaseModel):
    is_available: bool | None = None
    last_donated_at: date | None = None
    contact_visibility: str | None = None