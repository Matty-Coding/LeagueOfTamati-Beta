export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  avatar: string;
  background: string;
  extreme_game_record: number;
  current_rank: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthAction =
  | {
      type: "LOGIN";
      payload: { user: User; accessToken: string; csrfToken: string };
    }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "REFRESH_TOKEN";
      payload: { accessToken: string; csrfToken: string; user: User };
    }
  | { type: "UPDATE_USER"; payload: Partial<User> };
