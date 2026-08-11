from itsdangerous import URLSafeTimedSerializer
from app.core.config import settings
from datetime import datetime, timedelta, timezone
from jose import jwt
import bcrypt
from fastapi import Response

# ====================================
# ========  hash password  ===========
# ====================================


def generate_hashed_password(password: str) -> str:
    """
    Returns hashed password
    """

    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def check_hashed_password(password: str, hashed: str) -> bool:
    """
    Checks if password is correct
    """

    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed.encode("utf-8")
    )


def generate_reset_password_token(user_id: int, email: str) -> str:
    """
    Returns reset password token
    """

    serializer = URLSafeTimedSerializer(settings.RESET_PASSWORD_SECRET_KEY)

    data = {
        "user_id": user_id,
        "email": email
    }
    return serializer.dumps(data, salt="reset-password")


def check_reset_password_token(token: str) -> dict | None:
    """
    Checks if reset password token is valid, returns dict with user_id and email
    """

    serializer = URLSafeTimedSerializer(settings.RESET_PASSWORD_SECRET_KEY)
    try:
        # 10 minutes
        return serializer.loads(token, salt="reset-password", max_age=60 * 10)
    except Exception:
        return None

# ====================================
# =============  JWT  ================
# ====================================


def generate_access_token(data: dict) -> str:
    """
    Returns access token
    """

    expire = (
        datetime.now(timezone.utc) +
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE)
    )
    return jwt.encode(
        {**data, "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def check_access_token(token: str) -> dict | None:
    """
    Decodes access token and returns payload
    """

    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
    except Exception:
        return None


def generate_refresh_token(data: dict, csrf_token: str) -> str:
    """
    Returns refresh token including csrf token in payload
    """

    expire = (
        datetime.now(timezone.utc) +
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE)
    )
    return jwt.encode(
        {**data, "exp": expire, "csrf_token": csrf_token},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def check_refresh_token(token: str) -> dict | None:
    """
    Decodes refresh token and returns payload
    """

    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
    except Exception:
        return None

# ====================================
# =============  CSRF  ===============
# ====================================


def generate_csrf_token(user_id: str) -> str:
    serializer = URLSafeTimedSerializer(settings.CSRF_SECRET_KEY)
    return serializer.dumps(user_id, salt="csrf")


def check_csrf_token(token: str) -> str | None:
    serializer = URLSafeTimedSerializer(settings.CSRF_SECRET_KEY)
    try:
        # during as long as refresh token is valid
        # matching the expiration of the refresh token
        max_age_seconds = 60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE
        return serializer.loads(token, salt="csrf", max_age=max_age_seconds)
    except Exception:
        return None

# =============================================
# =============  account activation  ==========
# =============================================


def generate_activation_token(user_id: int, email: str) -> str:
    """
    Returns activation token
    """

    serializer = URLSafeTimedSerializer(settings.ACTIVATION_SECRET_KEY)

    data = {
        "user_id": user_id,
        "email": email
    }
    return serializer.dumps(data, salt="activation")


def check_activation_token(token: str) -> dict | None:
    """
    Checks if activation token is valid, returns dict with user_id and email
    """

    serializer = URLSafeTimedSerializer(settings.ACTIVATION_SECRET_KEY)
    try:
        # 1 hour
        return serializer.loads(token, salt="activation", max_age=60 * 60)
    except Exception:
        return None


# ============================================
# ==============  token utility  =============
# ============================================

def set_tokens(response: Response, refresh_token: str, csrf_token: str) -> None:
    """
    Sets refresh token in cookie and csrf token in header of response
    """

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,     # True in production
        samesite="none",
        max_age=60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE
    )

    response.headers["X-CSRF-Token"] = csrf_token
