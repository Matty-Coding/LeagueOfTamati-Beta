from pydantic import BaseModel


class UserSearchResult(BaseModel):
    id: int
    username: str
    avatar: str

    class Config:
        from_attributes = True


class ChampionSearch(BaseModel):
    id: str
    champ_name: str
    champ_icon: str
