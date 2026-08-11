from __future__ import annotations

from typing import TYPE_CHECKING

from app.db.database import Base
from sqlalchemy import String, Integer, ForeignKey, Enum as SQLAEnum, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum
from datetime import datetime

if TYPE_CHECKING:
    from app.models.user import User


class AbilityKey(str, Enum):
    PASSIVE = "passive"
    Q = "q"
    W = "w"
    E = "e"
    R = "r"


class ExtremeGame(Base):

    __tablename__ = "extreme_game"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True, unique=True
    )

    champion_id: Mapped[str] = mapped_column(String(25), nullable=False)

    champion_name: Mapped[str] = mapped_column(String(25), nullable=False)

    ability_id: Mapped[AbilityKey] = mapped_column(
        SQLAEnum(AbilityKey), nullable=False
    )

    ability_description: Mapped[str] = mapped_column(
        String(256), nullable=False
    )

    current_score: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False)

    # automatic serialization, default list[str]
    extracted_abilities = mapped_column(JSON, default=list)

    # atomic identifier of the round
    round_id: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="extreme_game")
