from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.database import get_db
from app.models.content import Category
from app.schemas.content import CategoryCreate, CategoryOut, CategoryUpdate

router = APIRouter(
    prefix="/admin/categories",
    tags=["Categories (Admin)"],
    dependencies=[Depends(require_role("super_admin"))],
)


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.scalars(select(Category)).all()


@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(404, "ক্যাটাগরি পাওয়া যায়নি")
    return category


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    if payload.parent_id:
        parent = db.get(Category, payload.parent_id)
        if not parent:
            raise HTTPException(404, "প্যারেন্ট ক্যাটাগরি পাওয়া যায়নি")
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)):
    """এটাই আগে missing ছিল — এখন edit কাজ করবে"""
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(404, "ক্যাটাগরি পাওয়া যায়নি")
    if payload.parent_id == category_id:
        raise HTTPException(400, "একটা ক্যাটাগরি নিজের প্যারেন্ট হতে পারে না")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(404, "ক্যাটাগরি পাওয়া যায়নি")
    db.delete(category)
    db.commit()