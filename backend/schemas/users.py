from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = Field(default=None, gt=0)
    weight_kg: Optional[float] = Field(default=None, gt=0)
    dietary_preference: Optional[str] = None
    spice_level: Optional[str] = None
    allergies: Optional[List[str]] = None
    disliked_foods: Optional[List[str]] = None
    health_conditions: Optional[List[str]] = None
    health_goals: Optional[str] = None


class UserResponse(UserBase):
    id: int
    google_id: str
    is_admin: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = Field(default=None, gt=0)
    weight_kg: Optional[float] = Field(default=None, gt=0)
    dietary_preference: Optional[str] = None
    spice_level: Optional[str] = None
    allergies: Optional[List[str]] = None
    disliked_foods: Optional[List[str]] = None
    health_conditions: Optional[List[str]] = None
    health_goals: Optional[str] = None


class QuizSubmission(BaseModel):
    dietary_preference: str
    spice_level: str
    allergies: List[str] = []
    disliked_foods: List[str] = []
    health_conditions: List[str] = []
    health_goals: str
    target_weight_kg: Optional[float] = None
    activity_level: Optional[str] = None


class QuizResponse(BaseModel):
    message: str
    submitted_at: datetime


class AdminCustomer(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_admin: bool
    current_plan: Optional[str] = None
    subscription_end: Optional[date] = None

    model_config = {"from_attributes": True}

