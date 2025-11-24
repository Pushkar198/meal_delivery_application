"""FastAPI entrypoint for the VitalPlate backend service."""
from typing import List

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database.database import Base, SessionLocal, engine, get_db
from database.models import SubscriptionPlan
from routes import admin, auth, complaints, meals, subscriptions, users
from schemas import SubscriptionPlan as SubscriptionPlanSchema
from utils.settings import get_settings

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Meal Personalization API",
    version="1.0.0",
    description="Backend APIs for meal personalization, subscriptions, and delivery tracking.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(users.router, prefix="/api/users")
app.include_router(meals.router, prefix="/api/meals")
app.include_router(subscriptions.router, prefix="/api/subscriptions")
app.include_router(complaints.router, prefix="/api/complaints")
app.include_router(admin.router, prefix="/api/admin")


def seed_subscription_plans():
    defaults: List[SubscriptionPlanSchema] = [
        SubscriptionPlanSchema(
            id=0,
            name="Weekly Wellness",
            duration_days=7,
            price_per_day=18.0,
            description="7-day sampler with balanced meals.",
            is_active=True,
        ),
        SubscriptionPlanSchema(
            id=0,
            name="Monthly Momentum",
            duration_days=28,
            price_per_day=15.0,
            description="Best for habit building with premium nutrition.",
            is_active=True,
        ),
    ]
    db: Session = SessionLocal()
    try:
        if db.query(SubscriptionPlan).count() == 0:
            for plan in defaults:
                db.add(
                    SubscriptionPlan(
                        name=plan.name,
                        duration_days=plan.duration_days,
                        price_per_day=plan.price_per_day,
                        description=plan.description,
                        is_active=plan.is_active,
                    )
                )
            db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_subscription_plans()


@app.get("/", summary="Service info")
def root():
    return {"message": "Meal Personalization API is running"}


@app.get("/health", summary="Health check")
def health():
    return {"status": "healthy"}

