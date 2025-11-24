from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class SubscriptionPlan(BaseModel):
    id: int
    name: str
    duration_days: int
    price_per_day: float
    description: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


class SubscriptionCreate(BaseModel):
    plan_id: int


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan: SubscriptionPlan
    start_date: date
    end_date: date
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentResponse(BaseModel):
    id: int
    subscription_id: int
    amount: float
    currency: str
    status: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

