from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.google_oauth import verify_google_token
from auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from database.database import get_db
from database.models import User
from schemas import AuthResponse, GoogleAuthRequest, RefreshRequest, TokenResponse, UserResponse

router = APIRouter(tags=["auth"])


def _issue_tokens(user: User) -> TokenResponse:
    base_claims = {"user_id": user.id, "email": user.email, "is_admin": user.is_admin}
    access_token = create_access_token({**base_claims, "token_type": "access"})
    refresh_token = create_refresh_token({**base_claims, "token_type": "refresh"})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post(
    "/google",
    response_model=AuthResponse,
    summary="Authenticate with Google OAuth token",
    description="Verifies the provided Google token, creates a user if necessary, and returns JWT tokens.",
)
async def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    google_profile = await verify_google_token(payload.google_token)
    google_id = google_profile.get("sub")
    if not google_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google token missing subject")
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = User(
            google_id=google_id,
            email=google_profile.get("email"),
            name=google_profile.get("name") or google_profile.get("given_name") or "Unknown User",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    tokens = _issue_tokens(user)
    return AuthResponse(user=UserResponse.model_validate(user), **tokens.model_dump())


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh JWT access token",
    description="Uses a refresh token to issue a new access and refresh token pair.",
)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    claims = decode_token(payload.refresh_token)
    if claims.get("token_type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == claims.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return _issue_tokens(user)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Fetch current user profile",
    description="Returns the authenticated user's profile data.",
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

