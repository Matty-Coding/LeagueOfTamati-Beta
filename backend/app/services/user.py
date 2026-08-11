from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Friendship, Profile
from app.schemas.auth import UserCreate
from app.core.security import generate_hashed_password, check_reset_password_token
from app.services.search import get_user_by_id, get_user_by_username
from app.schemas.user import OtherUser
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload


async def create_user(db: AsyncSession, user: UserCreate) -> User:
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=generate_hashed_password(user.password),
    )
    db.add(db_user)

    # make sure to have user
    await db.flush()

    return db_user


async def reset_password(db: AsyncSession, token: str, password: str) -> None:
    """
    Check reset password token and reset password
    """

    user_data = check_reset_password_token(token)

    if not user_data:
        raise ValueError("Invalid token")

    db_user = await get_user_by_id(db, user_data["user_id"])

    if not db_user:
        raise ValueError("User not found")

    if not db_user.is_active:
        raise ValueError("Account not activated")

    db_user.hashed_password = generate_hashed_password(password)
    await db.commit()
    await db.refresh(db_user)


async def get_user(db: AsyncSession, username: str, current_user_id: int) -> OtherUser:
    """
    Get other user searched by username
    """

    user = await get_user_by_username(db, username)

    if not user:
        raise ValueError("User not found")

    if user.id == current_user_id:
        raise ValueError("You cannot get yourself")

    # check if user is already friends
    result = await db.execute(
        select(Friendship)
        .where(
            or_(
                and_(Friendship.requester_id == current_user_id,
                     Friendship.receiver_id == user.id),
                and_(Friendship.requester_id == user.id,
                     Friendship.receiver_id == current_user_id)
            )
        )
    )

    friendship = result.scalar_one_or_none()

    if not friendship:
        friendship_status = "none"

    elif friendship.status == "pending" and friendship.requester_id == current_user_id:
        friendship_status = "pending"

    elif friendship.status == "pending":
        friendship_status = "none"

    else:
        friendship_status = "friends"

    current_rank = await get_current_rank(db, user.id)

    return OtherUser(
        id=user.id,
        username=user.username,
        avatar=user.profile.avatar,
        background=user.profile.background,
        extreme_game_record=user.profile.extreme_game_record,
        friendship_status=friendship_status,
        current_rank=current_rank
    )


async def update_user_profile(db: AsyncSession, user_id: int, payload) -> User:
    db_user = await get_user_by_id(db, user_id)

    if not db_user:
        raise ValueError("User not found")

    for attr, value in payload.model_dump(exclude_unset=True).items():
        setattr(db_user.profile, attr, value)

    await db.commit()
    await db.refresh(db_user)

    return db_user


async def get_leaderboard(db: AsyncSession) -> list[User]:
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .join(Profile)
        .order_by(Profile.extreme_game_record.desc())
    )
    return result.scalars().all()


async def get_current_rank(db: AsyncSession, user_id: int) -> int:
    db_user = await get_user_by_id(db, user_id)

    if not db_user:
        raise ValueError("User not found")

    record_score = db_user.profile.extreme_game_record

    result = await db.execute(
        select(func.count(Profile.id))
        .where(Profile.extreme_game_record > record_score)
    )

    current_rank = result.scalar()

    return current_rank + 1
