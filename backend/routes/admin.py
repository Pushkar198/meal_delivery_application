from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth.jwt_handler import get_current_user
from database.database import get_db
from database.models import Complaint, Meal, User, UserSubscription
from schemas import ComplaintResponse, MealCreate, MealResponse, MealUpdate, UserResponse
from utils.security import admin_required

router = APIRouter(tags=["admin"])


@router.get("/dashboard", summary="Admin dashboard metrics")
def dashboard_metrics(
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    total_users = db.query(func.count(User.id)).scalar()
    active_subscriptions = (
        db.query(func.count(UserSubscription.id))
        .filter(UserSubscription.status == "ACTIVE")
        .scalar()
    )
    pending_complaints = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.status == "OPEN")
        .scalar()
    )
    return {
        "total_users": total_users,
        "active_subscriptions": active_subscriptions,
        "pending_complaints": pending_complaints,
    }


@router.get("/customers", response_model=List[UserResponse], summary="List customers")
def list_customers(
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    return db.query(User).all()


@router.get("/meals", response_model=List[MealResponse], summary="List meals")
def list_meals(
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    return db.query(Meal).all()


@router.post("/meals", response_model=MealResponse, status_code=status.HTTP_201_CREATED, summary="Create meal")
def create_meal(
    payload: MealCreate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    meal = Meal(**payload.model_dump())
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.put("/meals/{meal_id}", response_model=MealResponse, summary="Update meal")
def update_meal(
    meal_id: int,
    payload: MealUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(meal, field, value)
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.get("/complaints", response_model=List[ComplaintResponse], summary="List complaints")
def list_all_complaints(
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    return db.query(Complaint).all()


@router.put(
    "/complaints/{complaint_id}/resolve",
    response_model=ComplaintResponse,
    summary="Resolve complaint",
)
def resolve_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(admin_required),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    complaint.status = "RESOLVED"
    complaint.admin_notes = "Resolved by admin"
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint

