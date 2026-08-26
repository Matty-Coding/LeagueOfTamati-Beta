from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.auth import (
    UserCreate,
    RegisterResponse,
    UserLogin,
    LoginResponse,
    ResendActivationPayload,
)
from app.services.auth import (
    register_user,
    activate_user,
    login_user,
    refresh_user_token,
    resend_activation_token,
)
from app.core.security import set_tokens
from app.core.limiter import limiter
from app.services.user import get_current_rank

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)


@router.post("/register", response_model=RegisterResponse, status_code=201)
@limiter.limit("10/minute")
async def register(
    request: Request, user: UserCreate, db: AsyncSession = Depends(get_db)
):
    try:
        db_user = await register_user(db, user)
        return {
            "message": "Registration successful, please check your email to activate your account.",
            "email": db_user.email
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/activate-account/{token}", status_code=200)
async def activate_account(token: str, db: AsyncSession = Depends(get_db)):
    try:
        await activate_user(db, token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Account activated"}


@router.post("/login", status_code=200, response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    user: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    try:
        tokens = await login_user(db, user)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    set_tokens(response, tokens["refresh_token"], tokens["csrf_token"])

    current_rank = await get_current_rank(db, tokens["user"].id)

    return {
        "user": {
            "id": tokens["user"].id,
            "username": tokens["user"].username,
            "email": tokens["user"].email,
            "is_active": tokens["user"].is_active,
            "avatar": tokens["user"].profile.avatar,
            "background": tokens["user"].profile.background,
            "extreme_game_record": tokens["user"].profile.extreme_game_record,
            "current_rank": current_rank
        },
        "access_token": tokens["access_token"],
    }


@router.post("/refresh-token", status_code=200, response_model=LoginResponse)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Cookie(default=None),
):
    try:
        if not refresh_token:
            raise HTTPException(status_code=401, detail="Missing tokens")

        tokens = await refresh_user_token(db, refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    set_tokens(response, tokens["refresh_token"], tokens["csrf_token"])

    current_rank = await get_current_rank(db, tokens["user"].id)

    return {
        "access_token": tokens["access_token"],
        "user": {
            "id": tokens["user"].id,
            "username": tokens["user"].username,
            "email": tokens["user"].email,
            "is_active": tokens["user"].is_active,
            "avatar": tokens["user"].profile.avatar,
            "background": tokens["user"].profile.background,
            "extreme_game_record": tokens["user"].profile.extreme_game_record,
            "current_rank": current_rank
        },
    }


@router.post("/logout", status_code=200)
async def logout_user(response: Response):
    response.delete_cookie(
        key="refresh_token",
        path="/",
        samesite="none",
        secure=True,
        httponly=True,
    )
    return {"message": "Logout successful"}


@router.post("/resend-activation", status_code=200)
@limiter.limit("3/minute")
async def resend_activation(
    request: Request,
    payload: ResendActivationPayload,
    db: AsyncSession = Depends(get_db),
):
    try:
        await resend_activation_token(db, payload.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # always return 200 with positive message
    return {"message": "Activation email sent"}
