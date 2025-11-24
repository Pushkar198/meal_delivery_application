from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ComplaintCreate(BaseModel):
    assignment_id: int
    type: str
    description: str


class ComplaintResponse(BaseModel):
    id: int
    user_id: int
    assignment_id: int
    type: str
    description: str
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

