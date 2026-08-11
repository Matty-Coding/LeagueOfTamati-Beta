import { api } from "../apis/axios";
import type {
  ChampionSearch,
  ExtremeGameCheckRound,
  ExtremeGameResponse,
  ExtremeGameUserAnswer,
} from "../types/game";

export async function startExtremeGame(): Promise<ExtremeGameResponse> {
  const response = await api.get<ExtremeGameResponse>("/game/extreme/start");
  return response.data;
}

export async function checkExtremeGame({
  round_id,
  champion_name,
  ability_id,
}: ExtremeGameUserAnswer): Promise<ExtremeGameCheckRound> {
  const response = await api.post<ExtremeGameCheckRound>(
    "/game/extreme/check",
    {
      round_id: round_id,
      champion_name: champion_name,
      ability_id: ability_id,
    },
  );
  return response.data;
}

export async function currentExtremeRound(): Promise<ExtremeGameResponse> {
  const response = await api.get<ExtremeGameResponse>(
    "/game/extreme/current-round",
  );
  return response.data;
}

export async function endExtremeGame(): Promise<void> {
  const response = await api.delete<void>("/game/extreme/current-round");
  return response.data;
}

export async function searchChampions(): Promise<ChampionSearch> {
  const response = await api.get<ChampionSearch>("/search/champions");
  return response.data;
}

// storing data in session storage to caching it

const cacheDuration = 1000 * 60 * 60 * 5; // 6 hours cache

export async function getSearchChampions(): Promise<ChampionSearch[]> {
  const cachedData = sessionStorage.getItem("searchChampions");
  const cachedAt = sessionStorage.getItem("searchChampionsCachedAt");

  const isCacheValid =
    cachedData && cachedAt && Date.now() - Number(cachedAt) < cacheDuration;

  if (isCacheValid) {
    return JSON.parse(cachedData!) as ChampionSearch[];
  } else {
    const response = await api.get<ChampionSearch[]>("/search/champions");
    const data = response.data;
    sessionStorage.setItem("searchChampions", JSON.stringify(data));
    sessionStorage.setItem("searchChampionsCachedAt", String(Date.now()));
    return data;
  }
}
