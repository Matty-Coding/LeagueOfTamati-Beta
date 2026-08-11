import { useEffect, useState } from "react";
import type { Champion } from "../types/champions";
import { getChampionData, getChampionDataById } from "../services/champions";

export function useChampions() {
  const [data, setData] = useState<Champion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const response: Champion[] = await getChampionData();
        setData(response);
      } catch {
        setError("Failed to fetch champions");
      } finally {
        setLoading(false);
      }
    };
    fetchChampions();
  }, []);

  return { data, loading, error };
}

export function useChampionsById(id: string) {
  const [details, setDetails] = useState<Champion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response: Champion | null = await getChampionDataById(id);
        setDetails(response);
      } catch {
        setError("Failed to fetch champion details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  return { details, loading, error };
}
