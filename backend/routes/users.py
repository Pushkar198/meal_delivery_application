from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.jwt_handler import get_current_user
from database.database import get_db
from database.models import User
from schemas import QuizResponse, QuizSubmission, UserResponse, UserUpdate

router = APIRouter(tags=["users"])


@router.get("/profile", response_model=UserResponse, summary="Current user profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update current user profile",
)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post(
    "/quiz",
    response_model=QuizResponse,
    summary="Submit personalization quiz",
    description="Stores personalization preferences to tailor future meal plans.",
)
def submit_quiz(
    payload: QuizSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.add(current_user)
    db.commit()
    return QuizResponse(message="Quiz submitted successfully", submitted_at=datetime.utcnow())

