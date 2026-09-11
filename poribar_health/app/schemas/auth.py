from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=11, max_length=14)
    email: EmailStr | None = None
    password: str = Field(min_length=8)
    division_id: int | None = None
    district_id: int | None = None
    upazila_id: int | None = None


class VolunteerRegister(UserRegister):
    student_id_no: str
    institution_id: int
    semester: str
    service_upazila_id: int
    nid: str = Field(min_length=10, max_length=17)


class LoginRequest(BaseModel):
    phone: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    phone: str
    email: EmailStr | None
    status: str
    roles: list[str] = []

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
    
    
class ForgotPasswordRequest(BaseModel):
    phone: str


class ResetPasswordRequest(BaseModel):
    phone: str
    otp: str
    new_password: str = Field(min_length=8)