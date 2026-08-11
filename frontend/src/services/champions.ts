import { api } from "../apis/axios";
import type { Champion } from "../types/champions";

const cacheDuration = 1000 * 60 * 60 * 12; // 12 hours cache

export async function getChampionData(): Promise<Champion[]> {
  const cachedData = sessionStorage.getItem("championsData");
  const cachedAt = sessionStorage.getItem("championsDataCachedAt");

  const isCacheValid =
    cachedData && cachedAt && Date.now() - Number(cachedAt) < cacheDuration;

  if (isCacheValid) {
    return JSON.parse(cachedData!) as Champion[];
  } else {
    const response = await api.get<Champion[]>("/wiki");
    const data = response.data;
    sessionStorage.setItem("championsData", JSON.stringify(data));
    sessionStorage.setItem("championsDataCachedAt", String(Date.now()));
    return data;
  }
}

export async function getChampionDataById(
  championID: string,
): Promise<Champion | null> {
  const cachedData = sessionStorage.getItem("championsData");
  if (cachedData) {
    const champions = JSON.parse(cachedData) as Champion[];
    const championData = champions.find(
      (champion) => champion.id === championID,
    );
    return championData || null;
  } else {
    const response = await api.get<Champion>(`/wiki/${championID}`);
    return response.data;
  }
}
