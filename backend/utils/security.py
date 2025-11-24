from datetime import datetime
from typing import Dict

from fastapi import Depends

from auth.jwt_handler import require_admin
from database.models import User


def admin_required(current_user: User = Depends(require_admin)) -> User:
    """Dependency alias for admin-protected routes."""
    return current_user


def build_audit_entry(action: str, metadata: Dict) -> Dict:
    """Helper to format audit log entries."""
    return {"action": action, "metadata": metadata, "timestamp": datetime.utcnow().isoformat()}

