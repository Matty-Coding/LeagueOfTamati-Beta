from fastapi import APIRouter, Depends
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.search import get_all_users
from app.schemas.search import UserSearchResult, ChampionSearch
from app.core.dependencies import get_current_user
from app.utils.champion import get_data

router = APIRouter(
    prefix="/search",
    tags=["Search"],
    responses={404: {"description": "Not found"}},
)


@router.get("/all-users", status_code=200, response_model=list[UserSearchResult])
async def search_by_username(
    query: str,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    users = await get_all_users(db, query, current_user.id, limit=limit)

    return [{"id": user.id, "username": user.username, "avatar": user.profile.avatar} for user in users]


@router.get("/champions", status_code=200, response_model=list[ChampionSearch])
def get_champions():
    data = get_data()

    return [
        ChampionSearch(
            id=champion["id"],
            champ_name=champion["name"],
            champ_icon=champion["imageUrl"]
        ) for champion in data
    ]
