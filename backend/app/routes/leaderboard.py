from fastapi import APIRouter, Depends
from app.schemas.leaderboard import LeaderboardItem
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.user import get_leaderboard

router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", status_code=200, response_model=list[LeaderboardItem])
async def leaderboard(db: AsyncSession = Depends(get_db)):
    all_users = await get_leaderboard(db)

    return [
        LeaderboardItem(
            username=user.username,
            avatar=user.profile.avatar,
            record_score=user.profile.extreme_game_record
        ) for user in all_users
    ]
