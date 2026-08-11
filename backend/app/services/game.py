from sqlalchemy.ext.asyncio import AsyncSession
from app.models.game import ExtremeGame
from app.utils.champion import get_choices, get_censored_ability, format_champions_data
from app.schemas.game import (
    ExtremeGameCreateRound,
    ExtremeGameUserAnswer,
    ExtremeGameCheckRound,
    ExtremeGameNotFound,
    ExtremeGameRoundNotFound
)
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from random import choice
from app.models.user import Profile
from app.utils.champion import get_data

EXTREME_ROUND_TIMER = 20
DEELAY = 2


def get_existing_game(user_id: int):
    return (
        select(ExtremeGame)
        .where(ExtremeGame.user_id == user_id)
    )


class GameService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_round(self, user_id: int) -> ExtremeGameCreateRound:
        existing_game = await self.db.execute(get_existing_game(user_id))

        game = existing_game.scalar_one_or_none()

        is_expired = game is not None and await self._is_expired(game)

        extracted_abilities = game.extracted_abilities if (
            game is not None and not is_expired
        ) else []

        available_choices = set(get_choices()) - set(extracted_abilities)

        if not available_choices:
            raise ValueError("No more choices available")

        chosen_ability = choice(list(available_choices))

        champion_id, champion_name, ability_id = chosen_ability.split("_")

        data = format_champions_data()
        description = data[champion_id]["spells"][ability_id]["description"]
        censored_description = get_censored_ability(
            champion_id, champion_name, description
        )
        expires_at = (
            datetime.now(timezone.utc) +
            timedelta(seconds=EXTREME_ROUND_TIMER)
        )

        new_extracted_abilities = extracted_abilities + [chosen_ability]

        # create new game
        if game is None or is_expired:

            # check if user has an existing game and close it
            if game is not None:
                await self._close_run(game)

            game = ExtremeGame(
                user_id=user_id,
                champion_id=champion_id,
                champion_name=champion_name,
                ability_id=ability_id,
                ability_description=censored_description,
                expires_at=expires_at,
                extracted_abilities=new_extracted_abilities
            )
            self.db.add(game)

        # update record
        else:
            game.champion_id = champion_id
            game.champion_name = champion_name
            game.ability_id = ability_id
            game.ability_description = censored_description
            game.expires_at = expires_at
            game.extracted_abilities = new_extracted_abilities
            game.round_id = game.round_id + 1

        await self.db.commit()
        await self.db.refresh(game)

        return ExtremeGameCreateRound(
            round_id=game.round_id,
            ability_description=censored_description,
            current_score=game.current_score,
            expires_at=game.expires_at,
            server_now=datetime.now(timezone.utc)
        )

    async def _close_run(self, game: ExtremeGame) -> None:
        """
        Update profile record if needed and delete game to reset it 
        """

        query_profile = await self.db.execute(
            select(Profile).where(Profile.user_id == game.user_id)
        )
        profile = query_profile.scalar_one_or_none()

        if profile is not None and game.current_score > profile.extreme_game_record:
            profile.extreme_game_record = game.current_score

        await self.db.delete(game)
        await self.db.flush()  # force delete action

    async def _is_expired(self, game: ExtremeGame) -> bool:
        """
        Check if game is expired
        """

        expires_at = game.expires_at + timedelta(seconds=DEELAY)

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        return expires_at < datetime.now(timezone.utc)

    async def validate_round(self, user_id: int, user_answer: ExtremeGameUserAnswer) -> ExtremeGameCheckRound:
        existing_game = await self.db.execute(get_existing_game(user_id))
        game = existing_game.scalar_one_or_none()

        if game is None:
            raise ExtremeGameNotFound("Game not found")

        if game.round_id != user_answer.round_id:
            raise ExtremeGameRoundNotFound("Round not found")

        is_expired = await self._is_expired(game)

        is_wrong = (
            game.champion_name != user_answer.champion_name
            or game.ability_id != user_answer.ability_id
        )

        data = get_data()

        correct_champion = next(
            champion for champion in data if champion["id"] == game.champion_id
        )

        correct_spell = next(
            spell for spell in correct_champion["spells"] if spell["id"] == game.ability_id
        )

        if is_expired or is_wrong:
            end_round = ExtremeGameCheckRound(
                correct=False,
                correct_champion_name=game.champion_name,
                correct_ability_id=game.ability_id,
                correct_champion_spell_icon=correct_spell["imageUrl"],
                correct_champion_id=game.champion_id,
                correct_champion_image=correct_champion["skins"][0]["imageUrl"],
                timeout=is_expired,
                current_score=game.current_score
            )

            await self._close_run(game)
            await self.db.commit()

            return end_round

        game.current_score += 1

        await self.db.commit()

        return ExtremeGameCheckRound(
            correct=True,
            correct_champion_name=game.champion_name,
            correct_ability_id=game.ability_id,
            correct_champion_spell_icon=correct_spell["imageUrl"],
            correct_champion_id=game.champion_id,
            correct_champion_image=correct_champion["skins"][0]["imageUrl"],
            current_score=game.current_score,
            timeout=is_expired,
            next_round=await self.create_round(user_id)
        )

    async def get_current_round(self, user_id: int) -> ExtremeGameCreateRound:
        """
        Get current round to persist at client refresh
        """

        existing_game = await self.db.execute(get_existing_game(user_id))
        game = existing_game.scalar_one_or_none()

        if game is None:
            raise ExtremeGameNotFound("Game not found")

        if await self._is_expired(game):
            await self._close_run(game)
            await self.db.commit()

            raise ExtremeGameNotFound("Round not found")

        return ExtremeGameCreateRound(
            round_id=game.round_id,
            ability_description=game.ability_description,
            current_score=game.current_score,
            expires_at=game.expires_at,
            server_now=datetime.now(timezone.utc)
        )

    async def delete_current_round(self, user_id: int) -> None:
        existing_game = await self.db.execute(get_existing_game(user_id))
        game = existing_game.scalar_one_or_none()

        if game is None:
            raise ExtremeGameNotFound("Game not found")

        await self._close_run(game)
        await self.db.commit()

        return
