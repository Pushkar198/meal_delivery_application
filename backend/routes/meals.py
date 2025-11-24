from datetime import date, datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth.jwt_handler import get_current_user
from database.database import get_db
from database.models import DailyMealAssignment, User
from schemas import MealAssignment

router = APIRouter(tags=["meals"])


@router.get("/today", response_model=List[MealAssignment], summary="Today's meals")
def get_today_meals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignments = (
        db.query(DailyMealAssignment)
        .filter(
            DailyMealAssignment.user_id == current_user.id,
            DailyMealAssignment.assignment_date == date.today(),
        )
        .all()
    )
    return assignments


@router.get(
    "/upcoming",
    response_model=List[MealAssignment],
    summary="Upcoming meals",
)
def get_upcoming_meals(
    days: int = Query(7, gt=0, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start = date.today()
    end = start + timedelta(days=days)
    assignments = (
        db.query(DailyMealAssignment)
        .filter(
            DailyMealAssignment.user_id == current_user.id,
            DailyMealAssignment.assignment_date >= start,
            DailyMealAssignment.assignment_date <= end,
        )
        .order_by(DailyMealAssignment.assignment_date.asc())
        .all()
    )
    return assignments


@router.post(
    "/{assignment_id}/confirm-delivery",
    summary="Confirm meal delivery",
)
def confirm_delivery(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = (
        db.query(DailyMealAssignment)
        .filter(
            DailyMealAssignment.id == assignment_id,
            DailyMealAssignment.user_id == current_user.id,
        )
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    assignment.delivery_status = "DELIVERED"
    assignment.delivered_at = datetime.utcnow()
    db.add(assignment)
    db.commit()
    return {"message": "Delivery confirmed"}

