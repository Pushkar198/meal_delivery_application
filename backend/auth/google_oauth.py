from typing import Any, Dict

import httpx
from fastapi import HTTPException, status

from utils.settings import get_settings

settings = get_settings()
GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"


async def verify_google_token(id_token: str) -> Dict[str, Any]:
    """Validate a Google ID token and return the payload."""
    params = {"id_token": id_token}
    async with httpx.AsyncClient() as client:
        response = await client.get(GOOGLE_TOKEN_INFO_URL, params=params, timeout=10)
    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")
    payload = response.json()
    if payload.get("aud") != settings.google_client_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token audience mismatch")
    return payload

