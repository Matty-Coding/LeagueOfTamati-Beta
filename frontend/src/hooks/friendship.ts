import { useState, useEffect, useCallback } from "react";
import {
  getFriendlist,
  addFriend,
  acceptOrReject,
  deleteFriendship,
} from "../services/friendship";
import type { Friendship, FriendshipStatus } from "../types/friendship";
import { useAuth } from "./auth";

export function useFriendlist() {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoading } = useAuth();

  const fetchFriendlist = useCallback(async () => {
    try {
      setLoading(true);
      setFriendships(await getFriendlist());
      setError(null);
    } catch {
      setError("Impossibile caricare la lista amici");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadFriendlist = async () => {
      await fetchFriendlist();
    };
    if (isLoading) return;
    loadFriendlist();
  }, [fetchFriendlist, isLoading]);

  const sendRequest = async (receiverId: number) => {
    const created = await addFriend(receiverId);
    setFriendships((prev) => [...prev, created]);
  };

  const respondToRequest = async (
    friendshipId: number,
    status: Extract<FriendshipStatus, "accepted" | "rejected">,
  ) => {
    const updated = await acceptOrReject(friendshipId, status);
    setFriendships((prev) =>
      status === "rejected"
        ? prev.filter((f) => f.friendship_id !== friendshipId)
        : prev.map((f) =>
            f.friendship_id === friendshipId
              ? { ...f, status: updated.status }
              : f,
          ),
    );
  };

  const removeFriendship = async (friendshipId: number) => {
    await deleteFriendship(friendshipId);
    setFriendships((prev) =>
      prev.filter((f) => f.friendship_id !== friendshipId),
    );
  };

  return {
    friendships,
    loading,
    error,
    sendRequest,
    respondToRequest,
    removeFriendship,
    refetch: fetchFriendlist,
  };
}
