from pydantic import BaseModel, EmailStr, field_validator
from app.schemas.user import UserResponse
from re import match


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        username_regex = r"^\w{3,20}$"
        if not match(username_regex, value):
            raise ValueError(
                "Username must be between 3 and 20 characters long and contain no spaces or special characters"
            )

        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        password_regex = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#.%^&?*])[A-Za-z0-9!@#.%^&?*]{8,}$"
        if not match(password_regex, value):
            raise ValueError(
                "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"
            )

        return value


class RegisterResponse(BaseModel):
    message: str
    email: EmailStr


class UserLogin(BaseModel):
    username: str  # username is unique
    password: str


class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str


class ResendActivationPayload(BaseModel):
    email: EmailStr
