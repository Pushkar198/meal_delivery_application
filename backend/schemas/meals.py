from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MealBase(BaseModel):
    name: str
    description: Optional[str] = None
    meal_type: str
    ingredients: List[str]
    calories: int = Field(..., gt=0)
    protein_g: Optional[float] = Field(default=None, ge=0)
    carbs_g: Optional[float] = Field(default=None, ge=0)
    fats_g: Optional[float] = Field(default=None, ge=0)
    dietary_tags: Optional[List[str]] = None
    is_vegetarian: Optional[bool] = True
    spice_level: Optional[str] = None
    is_active: Optional[bool] = True


class MealCreate(MealBase):
    pass


class MealUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    meal_type: Optional[str] = None
    ingredients: Optional[List[str]] = None
    calories: Optional[int] = Field(default=None, gt=0)
    protein_g: Optional[float] = Field(default=None, ge=0)
    carbs_g: Optional[float] = Field(default=None, ge=0)
    fats_g: Optional[float] = Field(default=None, ge=0)
    dietary_tags: Optional[List[str]] = None
    is_vegetarian: Optional[bool] = None
    spice_level: Optional[str] = None
    is_active: Optional[bool] = None


class MealResponse(MealBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class MealAssignment(BaseModel):
    id: int
    user_id: int
    meal: MealResponse
    assignment_date: date
    delivery_status: str
    delivered_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

