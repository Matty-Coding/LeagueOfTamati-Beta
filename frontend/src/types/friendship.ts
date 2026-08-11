export interface Friendship {
  friendship_id: number;
  status: "pending" | "accepted" | "rejected";
  friend: UserSearchResult;
  is_requester: boolean;
}

export interface FriendshipAction extends Friendship {
  message: string;
}

export interface UserSearchResult {
  id: number;
  username: string;
  avatar: string;
}

export type FriendshipStatus = "pending" | "accepted" | "rejected";

export type FriendshipStatusToDisplay = "none" | "pending" | "friends";
