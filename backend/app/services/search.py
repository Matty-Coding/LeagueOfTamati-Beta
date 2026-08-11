from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from sqlalchemy import select
from sqlalchemy.orm import selectinload


async def get_user_by_id(db: AsyncSession, id: int) -> User | None:
    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .where(User.id == id)
    )
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).options(selectinload(User.profile)).where(User.username == username))
    return result.scalar_one_or_none()


async def get_all_users(db: AsyncSession, query: str, current_user_id: int, limit: int) -> list[User]:
    """
    Get all users by username, excluding the current user and limiting the results with specified limit or 10 by default
    """

    result = await db.execute(
        select(User)
        .options(selectinload(User.profile))
        .where(
            User.username.ilike(f"%{query}%"),
            User.id != current_user_id
        )
        .limit(limit)
    )

    return result.scalars().all()
