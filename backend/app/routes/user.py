from fastapi import APIRouter, Depends, Request, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.limiter import limiter
from app.schemas.user import ResetPasswordPayload, ResetPasswordConfirmPayload, UpdateUserProfilePayload
from app.services.auth import send_reset_password_token
from app.services.user import reset_password, get_user, update_user_profile, get_current_rank
from app.schemas.user import UserResponse, OtherUser
from app.core.config import settings
from app.core.security import delete_cookie_tokens

router = APIRouter(
    prefix="/user",
    tags=["User"],
    responses={404: {"description": "Not found"}},
    # dependencies=[Depends(get_current_user)]
)


@router.get("/me", status_code=200, response_model=UserResponse)
async def get_me(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):

    current_rank = await get_current_rank(db, current_user.id)

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "avatar": current_user.profile.avatar,
        "background": current_user.profile.background,
        "extreme_game_record": current_user.profile.extreme_game_record,
        "current_rank": current_rank
    }


@router.post("/reset-password-request", status_code=200)
@limiter.limit("3/hour")
async def reset_password_request(
    request: Request,
    paylaod: ResetPasswordPayload,
    db: AsyncSession = Depends(get_db)
):
    try:
        await send_reset_password_token(db, paylaod.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Reset password email sent"}


@router.patch("/reset-password/{token}", status_code=200)
async def reset_password_endpoint(
    request: Request,
    response: Response,
    token: str,
    payload: ResetPasswordConfirmPayload,
    db: AsyncSession = Depends(get_db)
):
    try:
        await reset_password(db, token, payload.password)
        if settings.REFRESH_TOKEN_COOKIE_NAME in request.cookies:
            delete_cookie_tokens(response)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Password reset successfully"}


@router.get("/{username}", status_code=200, response_model=OtherUser)
async def get_other_user(
    username: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    try:
        return await get_user(db, username, current_user.id)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/update", status_code=200, response_model=UserResponse)
async def update_profile(
    payload: UpdateUserProfilePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    try:
        db_user = await update_user_profile(db, current_user.id, payload)
        current_rank = await get_current_rank(db, current_user.id)

        return UserResponse(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            is_active=db_user.is_active,
            avatar=db_user.profile.avatar,
            background=db_user.profile.background,
            extreme_game_record=db_user.profile.extreme_game_record,
            current_rank=current_rank
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
