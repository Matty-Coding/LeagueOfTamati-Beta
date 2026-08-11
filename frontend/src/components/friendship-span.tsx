import { useState, type JSX } from "react";
import type { FriendshipStatusToDisplay } from "../types/friendship";
import { FaUserCheck, FaUserClock, FaUserPlus } from "react-icons/fa6";
import { addFriend } from "../services/friendship";
import Spinner from "./spinner";

interface FriendshipSpanProps {
  targetUserId: number;
  status: FriendshipStatusToDisplay;
  onStatusChange: (newStatus: FriendshipStatusToDisplay) => void;
}

export function FriendshipSpan({
  targetUserId,
  status,
  onStatusChange,
}: FriendshipSpanProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);

  const handleAddFriend = async () => {
    try {
      setLoading(true);
      const response = await addFriend(targetUserId);
      if (response.status === "pending") onStatusChange("pending");
      else if (response.status === "accepted") onStatusChange("friends");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {status === "none" && (
        <button
          type="button"
          onClick={handleAddFriend}
          disabled={isLoading}
          className="friendship-span hover:bg-lol-text-muted/80 hover:text-lol-bg transition-color duration-200 ease-in"
        >
          {isLoading && <Spinner />}
          {error ? (
            error
          ) : (
            <>
              Add Friend <FaUserPlus />
            </>
          )}
        </button>
      )}

      {status === "pending" && (
        <span className="friendship-span">
          Request sent <FaUserClock />
        </span>
      )}

      {status === "friends" && (
        <span className="friendship-span">
          Friends <FaUserCheck />
        </span>
      )}
    </>
  );
}
