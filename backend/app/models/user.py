from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey, DateTime, func, UniqueConstraint, CheckConstraint, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.models.game import ExtremeGame

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.game import ExtremeGame


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # unique + index
    username: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    hashed_password: Mapped[str] = mapped_column(String(256))
    is_active: Mapped[bool] = mapped_column(default=False)

    # ONE TO ONE relationship with Profile table
    profile: Mapped["Profile"] = relationship(
        "Profile", back_populates="user", uselist=False)

    # ONE TO MANY relationship with Friendship table
    friendships: Mapped[list["Friendship"]] = relationship(
        "Friendship", foreign_keys="Friendship.requester_id",
        back_populates="requester")

    friend_requests_received: Mapped[list["Friendship"]] = relationship(
        "Friendship", foreign_keys="Friendship.receiver_id",
        back_populates="receiver")

    # ONE TO ONE relationship with ExtremeGame table
    extreme_game: Mapped["ExtremeGame"] = relationship(
        "ExtremeGame", back_populates="user", uselist=False)


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # foreign key to user id
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, unique=True)

    avatar: Mapped[str] = mapped_column(
        String(256), nullable=False, default="https://ddragon.leagueoflegends.com/cdn/16.13.1/img/champion/Aatrox.png")

    background: Mapped[str] = mapped_column(
        String(256), nullable=False, default="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg"
    )

    extreme_game_record: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0)

    # last seen at default on create
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now())

    # ONE TO ONE relationship with User table
    user: Mapped["User"] = relationship("User", back_populates="profile")


class Friendship(Base):
    __tablename__ = "friendships"

    __table_args__ = (
        # unique constraint requester > receiver to avoid spam friend requests on the same user
        UniqueConstraint("requester_id", "receiver_id",
                         name="unique_friendship"),

        # check constraint to avoid sending a friend request to yourself
        CheckConstraint("requester_id != receiver_id", name="different_users"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # foreign key to user id (requester)
    # CASCADE deletes the friendship if the user is deleted
    requester_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"))

    # foreign key to user id (receiver)
    # CASCADE deletes the friendship if the user is deleted
    receiver_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"))

    # status of the friendship request
    # default to pending (other states: accepted, rejected)
    # server default and not default to give default value directly in db
    status: Mapped[str] = mapped_column(
        String(20), server_default="pending", nullable=False)

    # relationship to User table MANY TO ONE
    requester: Mapped["User"] = relationship(
        "User", foreign_keys=[requester_id], back_populates="friendships")

    # relationship to User table MANY TO ONE
    receiver: Mapped["User"] = relationship(
        "User", foreign_keys=[receiver_id], back_populates="friend_requests_received")
