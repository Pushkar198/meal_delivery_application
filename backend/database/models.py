from datetime import datetime, date

import pytz
from sqlalchemy import (
    ARRAY,
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database.database import Base


def utcnow():
    """Return aware UTC timestamp."""
    return datetime.now(pytz.UTC)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    age = Column(Integer)
    gender = Column(String(50))
    height_cm = Column(Float)
    weight_kg = Column(Float)
    dietary_preference = Column(String(50))
    spice_level = Column(String(50))
    allergies = Column(ARRAY(String))
    disliked_foods = Column(ARRAY(String))
    health_conditions = Column(ARRAY(String))
    health_goals = Column(String(100))
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    subscriptions = relationship("UserSubscription", back_populates="user")
    meal_assignments = relationship("DailyMealAssignment", back_populates="user")
    complaints = relationship("Complaint", back_populates="user")
    payments = relationship("Payment", back_populates="user")


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    duration_days = Column(Integer, nullable=False)
    price_per_day = Column(Float, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

    subscriptions = relationship("UserSubscription", back_populates="plan")


class UserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    start_date = Column(Date, nullable=False, default=date.today)
    end_date = Column(Date, nullable=False)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    payments = relationship("Payment", back_populates="subscription")


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    meal_type = Column(String(50), nullable=False)
    ingredients = Column(ARRAY(String), nullable=False)
    calories = Column(Integer, nullable=False)
    protein_g = Column(Float)
    carbs_g = Column(Float)
    fats_g = Column(Float)
    dietary_tags = Column(ARRAY(String))
    is_vegetarian = Column(Boolean, default=True)
    spice_level = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    assignments = relationship("DailyMealAssignment", back_populates="meal")


class DailyMealAssignment(Base):
    __tablename__ = "daily_meal_assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=False)
    assignment_date = Column(Date, nullable=False)
    delivery_status = Column(String(50), default="PENDING")
    delivered_at = Column(DateTime)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="meal_assignments")
    meal = relationship("Meal", back_populates="assignments")
    complaints = relationship("Complaint", back_populates="assignment")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignment_id = Column(Integer, ForeignKey("daily_meal_assignments.id"), nullable=False)
    type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN")
    admin_notes = Column(Text)
    created_at = Column(DateTime, default=utcnow)
    resolved_at = Column(DateTime)

    user = relationship("User", back_populates="complaints")
    assignment = relationship("DailyMealAssignment", back_populates="complaints")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subscription_id = Column(Integer, ForeignKey("user_subscriptions.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="PENDING")
    payment_method = Column(String(50))
    transaction_id = Column(String(255))
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="payments")
    subscription = relationship("UserSubscription", back_populates="payments")

