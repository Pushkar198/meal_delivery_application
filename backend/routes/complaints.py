from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.jwt_handler import get_current_user
from database.database import get_db
from database.models import Complaint, DailyMealAssignment, User
from schemas import ComplaintCreate, ComplaintResponse

router = APIRouter(tags=["complaints"])


@router.post(
    "/",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a complaint",
)
def submit_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = (
        db.query(DailyMealAssignment)
        .filter(
            DailyMealAssignment.id == payload.assignment_id,
            DailyMealAssignment.user_id == current_user.id,
        )
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    complaint = Complaint(user_id=current_user.id, **payload.model_dump())
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get(
    "/",
    response_model=List[ComplaintResponse],
    summary="List user's complaints",
)
def list_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaints = db.query(Complaint).filter(Complaint.user_id == current_user.id).all()
    return complaints

