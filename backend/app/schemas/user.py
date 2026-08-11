from pydantic import BaseModel, EmailStr, field_validator
from re import match
from typing import Literal


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    avatar: str
    background: str
    extreme_game_record: int
    current_rank: int

    model_config = {"from_attributes": True}


class OtherUser(BaseModel):
    id: int
    username: str
    avatar: str
    background: str
    extreme_game_record: int
    current_rank: int
    friendship_status: Literal["none", "pending", "friends"]


class ResetPasswordPayload(BaseModel):
    email: EmailStr


class ResetPasswordConfirmPayload(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        password_regex = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#.%^&?*])[A-Za-z0-9!@#.%^&?*]{8,}$"
        if not match(password_regex, value):
            raise ValueError(
                "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"
            )

        return value


class UpdateUserProfilePayload(BaseModel):
    avatar: str
    background: str
