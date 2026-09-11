from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.database import get_db
from app.models.hospital import Department, Doctor, Hospital
from app.schemas.hospital import DepartmentCreate, DepartmentOut, DepartmentUpdate, DoctorCreate, DoctorOut, DoctorUpdate

router = APIRouter(
    tags=["Departments & Doctors (Admin)"],
    dependencies=[Depends(require_role("super_admin"))],
)


@router.post("/admin/hospitals/{hospital_id}/departments", response_model=DepartmentOut, status_code=201)
def create_department(hospital_id: int, payload: DepartmentCreate, db: Session = Depends(get_db)):
    hospital = db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(404, "হাসপাতাল পাওয়া যায়নি")
    department = Department(hospital_id=hospital_id, **payload.model_dump())
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


@router.patch("/admin/departments/{department_id}", response_model=DepartmentOut)
def update_department(department_id: int, payload: DepartmentUpdate, db: Session = Depends(get_db)):
    department = db.get(Department, department_id)
    if not department:
        raise HTTPException(404, "বিভাগ পাওয়া যায়নি")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(department, field, value)
    db.commit()
    db.refresh(department)
    return department


@router.delete("/admin/departments/{department_id}", status_code=204)
def delete_department(department_id: int, db: Session = Depends(get_db)):
    department = db.get(Department, department_id)
    if not department:
        raise HTTPException(404, "বিভাগ পাওয়া যায়নি")
    db.delete(department)
    db.commit()


@router.post("/admin/departments/{department_id}/doctors", response_model=DoctorOut, status_code=201)
def create_doctor(department_id: int, payload: DoctorCreate, db: Session = Depends(get_db)):
    department = db.get(Department, department_id)
    if not department:
        raise HTTPException(404, "বিভাগ পাওয়া যায়নি")
    doctor = Doctor(department_id=department_id, **payload.model_dump())
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


@router.patch("/admin/doctors/{doctor_id}", response_model=DoctorOut)
def update_doctor(doctor_id: int, payload: DoctorUpdate, db: Session = Depends(get_db)):
    doctor = db.get(Doctor, doctor_id)
    if not doctor:
        raise HTTPException(404, "ডাক্তার পাওয়া যায়নি")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(doctor, field, value)
    db.commit()
    db.refresh(doctor)
    return doctor


@router.delete("/admin/doctors/{doctor_id}", status_code=204)
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.get(Doctor, doctor_id)
    if not doctor:
        raise HTTPException(404, "ডাক্তার পাওয়া যায়নি")
    db.delete(doctor)
    db.commit()