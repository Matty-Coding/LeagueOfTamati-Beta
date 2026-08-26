from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Profile
from app.schemas.auth import UserCreate, UserLogin
from app.core.security import (
    generate_activation_token,
    generate_access_token,
    generate_refresh_token,
    generate_csrf_token,
    generate_reset_password_token,
    check_activation_token,
    check_hashed_password,
    check_refresh_token,
)
from app.core.email import send_activation_email, send_reset_password_email
from app.services.user import create_user
from app.services.search import get_user_by_email, get_user_by_username, get_user_by_id


async def register_user(db: AsyncSession, user: UserCreate) -> User:
    """
    Check if user already exists by email or username and create new user if not

    Create user profile automatically
    """

    if await get_user_by_username(db, user.username):
        raise ValueError("Username already registered")

    elif await get_user_by_email(db, user.email):
        raise ValueError("Email already registered")

    db_user = await create_user(db, user)

    # create profile for new user
    new_profile = Profile(user_id=db_user.id)
    db.add(new_profile)

    # commit to save both user and profile
    await db.commit()
    await db.refresh(db_user)

    activation_token = generate_activation_token(
        user_id=db_user.id, email=db_user.email
    )
    await send_activation_email(db_user.email, activation_token)

    return db_user


async def activate_user(db: AsyncSession, token: str) -> None:
    """
    Activates user account
    """

    user_data = check_activation_token(token)

    if not user_data:
        raise ValueError("Invalid token")

    db_user = await get_user_by_id(db, user_data["user_id"])

    if not db_user:
        raise ValueError("User not found")

    if db_user.is_active:
        raise ValueError("User already activated")

    db_user.is_active = True
    await db.commit()
    await db.refresh(db_user)  # refresh with new data


async def login_user(db: AsyncSession, user: UserLogin) -> dict:
    """
    Check credentials and return JWT
    """

    db_user = await get_user_by_username(db, user.username)

    if not db_user or not check_hashed_password(user.password, db_user.hashed_password):
        raise ValueError("Invalid credentials")

    if not db_user.is_active:
        raise ValueError("Account not activated")

    csrf_token = generate_csrf_token(db_user.id)

    token_data = {"sub": str(db_user.id)}

    access_token = generate_access_token(data=token_data)
    refresh_token = generate_refresh_token(
        data=token_data, csrf_token=csrf_token)

    return {
        "user": db_user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "csrf_token": csrf_token
    }


async def refresh_user_token(db: AsyncSession, refresh_token: str) -> dict:
    """
    Check refresh token and return new JWT
    """

    refresh_token_data = check_refresh_token(refresh_token)

    if not refresh_token_data:
        raise ValueError("Invalid refresh token")

    db_user = await get_user_by_id(db, int(refresh_token_data["sub"]))

    if not db_user:
        raise ValueError("User not found")

    if not db_user.is_active:
        raise ValueError("Account not activated")

    csrf_token = generate_csrf_token(db_user.id)

    token_data = {"sub": str(db_user.id)}

    access_token = generate_access_token(data=token_data)
    refresh_token = generate_refresh_token(
        data=token_data, csrf_token=csrf_token)

    return {
        "user": db_user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "csrf_token": csrf_token
    }


async def resend_activation_token(db: AsyncSession, email: str) -> None:
    """
    Resend activation token
    """

    db_user = await get_user_by_email(db, email)

    if not db_user or db_user.is_active:
        return

    activation_token = generate_activation_token(
        user_id=db_user.id, email=db_user.email
    )

    await send_activation_email(db_user.email, activation_token)


async def send_reset_password_token(db: AsyncSession, email: str) -> None:
    """
    Send reset password token
    """

    db_user = await get_user_by_email(db, email)

    if not db_user or not db_user.is_active:
        return

    reset_password_token = generate_reset_password_token(
        user_id=db_user.id, email=db_user.email
    )

    await send_reset_password_email(db_user.email, reset_password_token)
