from pathlib import Path
import json
from typing import Any
from functools import lru_cache
from re import sub, escape

FILE_PATH = Path(__file__).parent.parent.parent / \
    "shared" / "data" / "en_US.json"


# caching in memory when function is called for the first time
@lru_cache(maxsize=1)
def get_data() -> list[dict[str, Any]]:
    """
    Returns data of champions.
    """

    with open(FILE_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


@lru_cache(maxsize=1)
def get_choices() -> list[str]:
    """
    Returns list of choices, where each choice is in formatted string like:

    "champion_id_champion_name_ability_id"

    ["Aatrox_Aatrox_passive", "Aatrox_Aatrox_q", "Nunu_Nunu & Willump_e"]
    """

    return [f"{champ["id"]}_{champ["name"]}_{spell["id"]}" for champ in get_data() for spell in champ["spells"]]


# exceptions
CHAMPION_NAME_OVERRIDE = {
    "JarvanIV": ["Jarvan IV", "Jarvan"],
    "Nunu": ["Nunu & Willump", "Nunu e Willump", "Willump", "Nunu"],
    "Renata": ["Renata Glasc", "Renata"],
    "Smolder": ["Smolders", "Smolder"],
    "KogMaw": ["Kog'Maw", "KogMaw", "Kogmaw"],
}


def get_censored_ability(champion_id: str, champion_name: str, ability_description: str) -> str:
    """
    Return censored ability.

    Example

    "Lucian quickly dashes a short distance."

    Returns

    "??? quickly dashes a short distance."
    """

    censored = ability_description

    # exception found
    if champion_id in CHAMPION_NAME_OVERRIDE:
        for name in CHAMPION_NAME_OVERRIDE[champion_id]:
            censored = sub(r"\b" + escape(name) + r"\b", "??????", censored)

    else:
        censored = sub(r"\b" + escape(champion_name) +
                       r"\b", "??????", censored)

    return censored


@lru_cache(maxsize=1)
def format_champions_data() -> dict[str, dict[str, Any]]:
    """
    Return formatted dict of champions data, also spells formatted as a dict

    champion_id: {

        "abilities": {

            "ability_id": {
                "name": ...,
                "description": ...
            },
            ...
        },
        ...
    }
    """

    champions_data = {}

    for champ in get_data():
        champ_copy = dict(champ)
        champ_copy["spells"] = {spell["id"]: spell for spell in champ["spells"]}

        champions_data[champ["id"]] = champ_copy

    return champions_data
