import type { User } from "../types/auth";
import { AuthContext } from "../contexts/auth.context";
import { useContext } from "react";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error("useAuthContext must be used within AuthProvider");

  const { state, dispatch } = context;

  const login = (user: User, accessToken: string, csrfToken: string) =>
    dispatch({ type: "LOGIN", payload: { user, accessToken, csrfToken } });

  const logout = () => dispatch({ type: "LOGOUT" });

  const refreshToken = (accessToken: string, csrfToken: string, user: User) =>
    dispatch({
      type: "REFRESH_TOKEN",
      payload: { accessToken, csrfToken, user },
    });

  const refreshUser = (updatedFields: Partial<User>) =>
    dispatch({
      type: "UPDATE_USER",
      payload: updatedFields,
    });

  return {
    user: state.user,
    accessToken: state.accessToken,
    csrfToken: state.csrfToken,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    refreshToken,
    refreshUser,
  };
}
