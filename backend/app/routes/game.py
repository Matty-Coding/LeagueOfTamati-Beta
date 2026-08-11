from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.schemas.game import (
    ExtremeGameCreateRound,
    ExtremeGameCheckRound,
    ExtremeGameUserAnswer,
    ExtremeGameNotFound,
    ExtremeGameRoundNotFound
)
from app.db.database import get_db
from app.models.user import User
from app.services.game import GameService
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    prefix="/game",
    tags=["Game"],
    responses={404: {"description": "Not found"}},
    dependencies=[Depends(get_current_user)],
)


@router.get("/extreme/start", status_code=200, response_model=ExtremeGameCreateRound)
async def get_extreme_game(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    service = GameService(db)

    try:
        return await service.create_round(current_user.id)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/extreme/check", status_code=200, response_model=ExtremeGameCheckRound)
async def check_extreme_game(
    payload: ExtremeGameUserAnswer,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    service = GameService(db)

    try:
        return await service.validate_round(current_user.id, payload)

    except ExtremeGameNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))

    except ExtremeGameRoundNotFound as e:
        raise HTTPException(status_code=409, detail=str(e))

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/extreme/current-round", status_code=200, response_model=ExtremeGameCreateRound)
async def get_current_round(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    service = GameService(db)

    try:
        return await service.get_current_round(current_user.id)

    except ExtremeGameNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/extreme/current-round", status_code=204)
async def delete_current_round(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    service = GameService(db)

    try:
        return await service.delete_current_round(current_user.id)

    except ExtremeGameNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
