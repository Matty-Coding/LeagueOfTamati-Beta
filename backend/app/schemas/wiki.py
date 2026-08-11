from pydantic import BaseModel


class Spell(BaseModel):
    id: str
    name: str
    description: str
    imageUrl: str


class Skin(BaseModel):
    name: str
    imageUrl: str


class Champion(BaseModel):
    id: str
    name: str
    title: str
    imageUrl: str
    lore: str
    tags: list[str]
    spells: list[Spell]
    skins: list[Skin]
