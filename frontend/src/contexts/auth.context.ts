import { createContext } from "react";
import type { AuthState, AuthAction } from "../types/auth";

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
