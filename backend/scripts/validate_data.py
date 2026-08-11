from pathlib import Path
from typing import Any
import requests
from shared.logger import get_logger

logger = get_logger("validate_data")

file_path = Path(__file__).parent.parent / "shared" / "data" / "en_US.json"


def validate_urls(data: list[dict[str, Any]]) -> list[str | None]:
    """
    Returns list of invalid image urls.
    """

    session = requests.Session()

    logger.info("Starting data validation...")
    error_list = []
    for item in data:
        champ_icon = [item["imageUrl"]]
        champ_skin_image = [skin["imageUrl"] for skin in item["skins"]]
        champ_spell_icon = [spell["imageUrl"] for spell in item["spells"]]

        for image_urls in champ_icon, champ_skin_image, champ_spell_icon:
            for image_url in image_urls:
                logger.info(f"Validating image {image_url}")
                response = session.head(image_url)

                if response.status_code != 200:
                    logger.error(f"Image {image_url} is not valid")
                    error_list.append(image_url)

    return error_list
