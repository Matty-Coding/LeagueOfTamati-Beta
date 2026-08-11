import { api } from "../apis/axios";
import type { User } from "../types/auth";
import type { LeaderboardItem } from "../types/leaderboard";
import type { OtherUser } from "../types/user";

export async function resetPasswordRequest(
  email: string,
): Promise<{ message: string }> {
  const response = await api.post("user/reset-password-request", {
    email: email,
  });
  return response.data;
}

export async function resetPasswordConfirmRequest(
  token: string,
  password: string,
): Promise<{ message: string }> {
  const response = await api.patch(`user/reset-password/${token}`, {
    password: password,
  });
  return response.data;
}

export async function getUserData(): Promise<User> {
  const response = await api.get("user/me");
  return response.data;
}

export async function getOtherUserData(username: string): Promise<OtherUser> {
  const response = await api.get(`user/${username}`);
  return response.data;
}

export async function updateUser(payload: Partial<User>): Promise<User> {
  const response = await api.patch("user/update", payload);
  return response.data;
}

export async function getLeaderboard(): Promise<LeaderboardItem[]> {
  const response = await api.get("/leaderboard");
  return response.data;
}
