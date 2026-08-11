from fastapi import APIRouter, HTTPException
from app.utils.champion import get_data
from app.schemas.wiki import Champion
# miosito.com/wiki/asodfgalsbfalsbf
router = APIRouter(
    prefix="/wiki",
    tags=["Wiki"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=list[Champion])
def get_wiki():
    return get_data()


@router.get("/{champion_id}", response_model=Champion)
def get_champion_details(champion_id: str):
    data = get_data()

    champion_data = next(
        (champion for champion in data if champion["id"] == champion_id),
        None
    )

    if not champion_data:
        raise HTTPException(status_code=404, detail="Champion not found")

    return champion_data
