import { api } from "../apis/axios";
import type { UserSearchResult } from "../types/friendship";

export async function searchUsers(
  query: string,
  limit = 10,
): Promise<UserSearchResult[]> {
  const response = await api.get<UserSearchResult[]>("/search/all-users", {
    params: { query, limit },
  });
  return response.data;
}
