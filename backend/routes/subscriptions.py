from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.jwt_handler import get_current_user
from database.database import get_db
from database.models import Payment, SubscriptionPlan, User, UserSubscription
from schemas import SubscriptionCreate, SubscriptionPlan as SubscriptionPlanSchema, SubscriptionResponse

router = APIRouter(tags=["subscriptions"])


@router.get("/plans", response_model=List[SubscriptionPlanSchema], summary="List subscription plans")
def list_plans(db: Session = Depends(get_db)):
    plans = db.query(SubscriptionPlan).filter(SubscriptionPlan.is_active.is_(True)).all()
    return plans


@router.post(
    "/subscribe",
    response_model=SubscriptionResponse,
    summary="Subscribe to a plan",
)
def subscribe(
    payload: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == payload.plan_id, SubscriptionPlan.is_active.is_(True)).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    start = date.today()
    end = start + timedelta(days=plan.duration_days)
    subscription = UserSubscription(
        user_id=current_user.id,
        plan_id=plan.id,
        start_date=start,
        end_date=end,
        status="ACTIVE",
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    payment = Payment(
        user_id=current_user.id,
        subscription_id=subscription.id,
        amount=plan.price_per_day * plan.duration_days,
        currency="USD",
        status="PENDING",
        payment_method="ONLINE",
    )
    db.add(payment)
    db.commit()
    db.refresh(subscription)
    return subscription


@router.get(
    "/current",
    response_model=Optional[SubscriptionResponse],
    summary="Current subscription",
)
def get_current_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subscription = (
        db.query(UserSubscription)
        .filter(
            UserSubscription.user_id == current_user.id,
            UserSubscription.status == "ACTIVE",
            UserSubscription.end_date >= date.today(),
        )
        .order_by(UserSubscription.end_date.desc())
        .first()
    )
    return subscription

