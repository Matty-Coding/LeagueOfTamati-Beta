export interface OtherUser {
  id: number;
  username: string;
  avatar: string;
  background: string;
  extreme_game_record: number;
  current_rank: number;
  friendship_status: "none" | "pending" | "friends";
}

export type UpdateUserProfile = Pick<OtherUser, "avatar" | "background">;
