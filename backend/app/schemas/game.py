from pydantic import BaseModel
from app.schemas.common import UTCDateTime
from app.models.game import AbilityKey


class ExtremeGameCreateRound(BaseModel):
    round_id: int
    ability_description: str
    current_score: int
    expires_at: UTCDateTime
    server_now: UTCDateTime


class ExtremeGameUserAnswer(BaseModel):
    round_id: int
    champion_name: str
    ability_id: AbilityKey


class ExtremeGameCheckRound(BaseModel):
    correct: bool
    correct_champion_name: str
    correct_ability_id: AbilityKey
    correct_champion_spell_icon: str
    correct_champion_image: str
    correct_champion_id: str
    current_score: int
    timeout: bool
    next_round: ExtremeGameCreateRound | None = None


class ExtremeGameNotFound(Exception):
    pass


class ExtremeGameRoundNotFound(Exception):
    pass
