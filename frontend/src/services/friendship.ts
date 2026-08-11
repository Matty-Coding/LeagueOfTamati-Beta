import { api } from "../apis/axios";
import type {
  Friendship,
  FriendshipAction,
  FriendshipStatus,
} from "../types/friendship";

export async function getFriendlist(): Promise<Friendship[]> {
  const response = await api.get<Friendship[]>("/friendship");
  return response.data;
}

export async function addFriend(receiverID: number): Promise<Friendship> {
  const response = await api.post<Friendship>("/friendship", {
    receiver_id: receiverID,
  });
  return response.data;
}

export async function acceptOrReject(
  friendshipID: number,
  status: Extract<FriendshipStatus, "accepted" | "rejected">,
): Promise<FriendshipAction> {
  const response = await api.patch<FriendshipAction>(
    `/friendship/${friendshipID}`,
    {
      status: status,
    },
  );
  return response.data;
}

export async function deleteFriendship(friendshipID: number): Promise<void> {
  await api.delete(`/friendship/${friendshipID}`);
}
