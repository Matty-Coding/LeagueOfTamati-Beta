import re
from pathlib import Path
import json
import requests
from shared.logger import get_logger
from typing import Any


class ApiLeague:
    """
    Class for interacting with Riot API of League of Legends.
    """

    def __init__(self):
        self.base_url: str = "https://ddragon.leagueoflegends.com"
        self.__session = requests.Session()
        self.logger = get_logger("api_data")
        self.code_language: str = "en_US"
        self.last_version = None

    def __clean_data(self, data: Any) -> Any:
        """
        Returns cleaned data.
        """
        if isinstance(data, list):
            return [self.__clean_data(item) for item in data]

        if isinstance(data, dict):
            return {key: self.__clean_data(value) for key, value in data.items()}

        if isinstance(data, str):
            text = re.sub(r"<[^>]+>", " ", data)
            text = re.sub(r"%[^%]+%", " ", text)
            text = re.sub(r"\s+", " ", text).strip()
            return text

        return data

    def __get(self, url: str) -> dict[str, Any] | None:
        """
        GET request to Riot API, returns json of response.
        """

        try:
            self.logger.info(f"GET: {url}")

            response = self.__session.get(url)
            response.raise_for_status()

            self.logger.info(f"Response: {response.status_code}")
            return self.__clean_data(response.json())

        except requests.exceptions.HTTPError as err:
            self.logger.error(err)

        except requests.exceptions.RequestException as err:
            self.logger.error(err)

        return None

    def __get_last_version(self) -> str:
        """
        Returns last version of Riot API.
        """

        self.logger.info("Getting last version...")

        versions = self.__get(
            f"{self.base_url}/api/versions.json"
        )

        self.logger.info(f"Last version: {versions[0]}")
        return versions[0] if versions else ""

    def __get_champion_ids(self, version: str) -> list[str] | None:
        """
        Returns list of champion ids.
        """

        self.logger.info("Getting champion ids...")

        response = self.__get(
            f"{self.base_url}/cdn/{version}/data/{self.code_language}/champion.json"
        )

        if response:
            self.logger.info("Created champion ids list")
            return list(champ_id for champ_id in response["data"].keys() if "Jade_" not in champ_id)

        self.logger.error("Failed to get champion ids")
        return None

    def __get_single_champion_data(self, id: str, version: str) -> dict[str, Any] | None:
        """
        Returns data of champion with given id.
        """

        self.logger.info(f"Getting data of {id}...")

        response = self.__get(
            f"{self.base_url}/cdn/{version}/data/{self.code_language}/champion/{id}.json"
        )

        if response:
            self.logger.info(f"{id} data found")
            return response["data"]

        self.logger.error(f"Failed to get data of {id}")
        return None

    def _get_champions_data(self) -> list[dict[str, Any]]:
        """
        Returns data of all champions.
        """

        self.last_version = self.__get_last_version()

        self.logger.info("Getting data of all champions...")
        champion_ids = self.__get_champion_ids(self.last_version)

        if not champion_ids:
            self.logger.error("Failed to get champion ids")
            return []

        return [self.__get_single_champion_data(id, self.last_version)[id] for id in champion_ids]


class ExtractApiContent(ApiLeague):
    """
    Class for extracting data of champions. Extends ApiLeague class.
    """

    def __init__(self):
        super().__init__()
        self.__champions_data = self._get_champions_data()
        self.data: list[dict[str, Any]] = []

    def __get_filtered_data(self) -> dict[str, Any]:
        """
        Filters data of champions.
        """

        if not self.__champions_data:
            self.logger.error("Failed to get filtered champions data")
            return {}

        self.logger.info("Filtering data...")

        for champion_data in self.__champions_data:
            self.data.append({
                "id": champion_data["id"],
                "name": champion_data["name"],
                "title": champion_data["title"],
                "imageUrl": f"{self.base_url}/cdn/{self.last_version}/img/champion/{champion_data['id']}.png",
                "lore": champion_data["lore"],
                "tags": champion_data["tags"],
                "spells": [
                    {
                        "id": "passive",
                        "name": champion_data["passive"]["name"],
                        "description": champion_data["passive"]["description"],
                        "imageUrl": f"{self.base_url}/cdn/{self.last_version}/img/passive/{champion_data['passive']['image']['full']}"
                    }
                ] + [
                    {
                        "id": key,
                        "name": spell["name"],
                        "description": spell["description"],
                        "imageUrl": f"{self.base_url}/cdn/{self.last_version}/img/spell/{spell['image']['full']}"
                    }
                    for key, spell in zip(
                        ("q", "w", "e", "r"),
                        champion_data["spells"]
                    )
                ],
                "skins": [
                    {
                        "name": champion_data["id"],
                        "imageUrl": f"""{self.base_url}/cdn/img/champion/splash/{'FiddleSticks' if champion_data['id'] == 'Fiddlesticks' else champion_data['id']}_0.jpg"""
                    },
                ] + [
                    {
                        "name": skin["name"],
                        "imageUrl": f"""{self.base_url}/cdn/img/champion/splash/{
                            'FiddleSticks'
                            if champion_data['id'] == 'Fiddlesticks'
                            else champion_data['id']
                        }_{skin['num']}.jpg"""
                    }
                    for skin in champion_data["skins"]
                    if "parentSkin" not in skin and skin["num"] != 0
                ]
            })

            self.logger.info(f"{champion_data['id']} data filtered")

        self.logger.info("Data filtering completed")
        return self.data

    def to_json(self):
        """
        Returns data of champions in json format.
        """

        self.logger.info("Creating data folder if not exists...")
        self.logger.info("Exporting filtered data to json...")

        file_path = Path(__file__).parent.parent / "shared" / "data"
        file_path.mkdir(exist_ok=True)

        data = self.__get_filtered_data()

        with open(file_path / f"{self.code_language}.json", "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4, ensure_ascii=False)

        self.logger.info("Data exported to json")
        return data
