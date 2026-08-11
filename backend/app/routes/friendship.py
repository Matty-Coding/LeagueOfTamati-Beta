from app.services.friendship import (
    send_friend_request,
    change_friendship_request_status,
    delete_friendship,
    get_friendlist
)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.friendship import (
    FriendRequestCreate,
    FriendshipResponse,
    FriendshipActionResponse,
    FriendshipStatusUpdate,
    FriendshipNotFoundError,
    FriendshipNotAuthorizedError
)
from app.models.user import Friendship, User
from app.core.dependencies import get_current_user
from app.schemas.search import UserSearchResult

router = APIRouter(
    prefix="/friendship",
    tags=["Friendship"],
    responses={404: {"description": "Not found"}},
    dependencies=[Depends(get_current_user)]
)


@router.get("/", status_code=200, response_model=list[FriendshipResponse])
async def get_friendships(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_friendlist(db, current_user.id)


@router.post("/", status_code=201, response_model=FriendshipResponse)
async def create_friendship(
    payload: FriendRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    try:
        db_friendship: Friendship = await send_friend_request(db, current_user.id, payload.receiver_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return FriendshipResponse(
        friendship_id=db_friendship.id,
        status=db_friendship.status,
        friend=UserSearchResult(
            id=db_friendship.receiver_id,
            username=db_friendship.receiver.username,
            avatar=db_friendship.receiver.profile.avatar
        ),
        is_requester=True
    )


@router.patch("/{friendship_id}", status_code=200, response_model=FriendshipActionResponse)
async def accepted_or_rejected(
    friendship_id: int,
    payload: FriendshipStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        db_friendship = await change_friendship_request_status(
            db, friendship_id, payload.status, current_user_id=current_user.id
        )

    except FriendshipNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except FriendshipNotAuthorizedError as e:
        raise HTTPException(status_code=403, detail=str(e))

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return FriendshipActionResponse(
        friendship_id=db_friendship.id,
        status=db_friendship.status,
        friend=UserSearchResult(
            id=db_friendship.requester_id,
            username=db_friendship.requester.username,
            avatar=db_friendship.requester.profile.avatar
        ),
        is_requester=False,
        message=f"Friend request {db_friendship.status}"
    )


@router.delete("/{friendship_id}", status_code=204)
async def remove_friendship(
    friendship_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await delete_friendship(db, friendship_id, current_user.id)

    except FriendshipNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except FriendshipNotAuthorizedError as e:
        raise HTTPException(status_code=403, detail=str(e))

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
