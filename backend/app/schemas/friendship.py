from pydantic import BaseModel
from typing import Literal
from app.schemas.search import UserSearchResult


class FriendRequestCreate(BaseModel):
    receiver_id: int


class FriendshipResponse(BaseModel):
    friendship_id: int
    status: Literal["pending", "accepted", "rejected"]
    friend: UserSearchResult
    is_requester: bool

    class Config:
        from_attributes = True


class FriendshipStatusUpdate(BaseModel):
    status: Literal["accepted", "rejected"]


class FriendshipActionResponse(FriendshipResponse):
    message: str


class FriendshipNotFoundError(Exception):
    pass


class FriendshipNotAuthorizedError(Exception):
    pass
