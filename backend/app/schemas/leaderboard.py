from pydantic import BaseModel


class LeaderboardItem(BaseModel):
    username: str
    avatar: str
    record_score: int
