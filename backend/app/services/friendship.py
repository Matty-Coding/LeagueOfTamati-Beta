from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from app.models.user import Friendship, User
from app.services.search import get_user_by_id
from app.schemas.friendship import FriendshipResponse
from app.schemas.search import UserSearchResult


async def _get_friendship_with_relations(db: AsyncSession, friendship_id: int) -> Friendship | None:
    """
    Get friendship with relations
    """

    result = await db.execute(
        select(Friendship)
        .where(Friendship.id == friendship_id)
        .options(
            selectinload(Friendship.requester).selectinload(User.profile),
            selectinload(Friendship.receiver).selectinload(User.profile),
        )
    )
    return result.scalar_one_or_none()


async def send_friend_request(db: AsyncSession, requester_id: int, receiver_id: int, current_user_id: int) -> Friendship:
    """
    Send friend request from requester to receiver
    """

    if requester_id == receiver_id:
        raise ValueError("Cannot send a friend request to yourself")

    if not await get_user_by_id(db, receiver_id):
        raise ValueError("Receiver user not found")

    # check if friend request already sent or already accepted
    result = await db.execute(
        select(Friendship)
        .where(
            or_(
                and_(Friendship.requester_id == requester_id,
                     Friendship.receiver_id == receiver_id),
                and_(Friendship.requester_id == receiver_id,
                     Friendship.receiver_id == requester_id)
            )
        )
    )

    existing = result.scalar_one_or_none()

    if existing and existing.status == "pending" and existing.requester_id == current_user_id:
        raise ValueError("Friend request already sent or already accepted")

    if existing and existing.status == "pending" and existing.receiver_id == current_user_id:
        return await change_friendship_request_status(db, existing.id, "accepted", current_user_id=current_user_id)

    if not existing:
        db_friendship = Friendship(
            requester_id=requester_id, receiver_id=receiver_id, status="pending"
        )
        db.add(db_friendship)
        await db.commit()

        return await _get_friendship_with_relations(db, db_friendship.id)


async def change_friendship_request_status(
    db: AsyncSession,
    friendship_id: int,
    status: str,
    current_user_id: int
) -> Friendship:
    """
    Change friend request status to accepted or rejected
    """

    db_friendship = await _get_friendship_with_relations(db, friendship_id)

    if not db_friendship:
        raise ValueError("Friendship request not found")

    if db_friendship.receiver_id != current_user_id:
        raise ValueError(
            "You are not authorized to respond to this friend request")

    if status == "rejected":
        await delete_friendship(db, friendship_id, current_user_id)

    db_friendship.status = status
    await db.commit()
    await db.refresh(db_friendship)
    return db_friendship


async def delete_friendship(db: AsyncSession, friendship_id: int, current_user_id: int) -> None:
    """
    Delete friend request
    """

    result = await db.execute(
        select(Friendship).where(Friendship.id == friendship_id)
    )

    db_friendship = result.scalar_one_or_none()

    if not db_friendship:
        raise ValueError("Friendship request not found")

    if db_friendship.requester_id != current_user_id and db_friendship.receiver_id != current_user_id:
        raise ValueError(
            "You are not authorized to delete this friend request")

    await db.delete(db_friendship)
    await db.commit()


async def get_friendlist(db: AsyncSession, current_user_id: int) -> list[FriendshipResponse]:
    """ 
    Get friend list ordered by username 
    """

    result = await db.execute(
        select(Friendship)
        .where(
            or_(
                Friendship.requester_id == current_user_id,
                Friendship.receiver_id == current_user_id
            )
        )
        .options(
            selectinload(Friendship.requester).selectinload(User.profile),
            selectinload(Friendship.receiver).selectinload(User.profile)
        )
    )

    data = result.scalars().all()

    friend_list: list[FriendshipResponse] = []

    for friendship in data:
        is_requester = friendship.requester_id == current_user_id
        other_user = (
            friendship.receiver
            if friendship.requester_id == current_user_id
            else friendship.requester
        )

        friend = UserSearchResult(
            id=other_user.id,
            username=other_user.username,
            avatar=other_user.profile.avatar
        )

        friend_list.append(
            FriendshipResponse(
                friendship_id=friendship.id,
                status=friendship.status,
                friend=friend,
                is_requester=is_requester
            )
        )

    return sorted(friend_list, key=lambda x: x.friend.username.lower())
