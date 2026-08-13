import { useEffect, useReducer, type JSX, type ReactNode } from "react";
import type { AuthState, AuthAction } from "../types/auth";
import { AuthContext } from "./auth.context";
import { refreshTokenRequest } from "../services/auth";
import { authActionsRef, authRef } from "../apis/interceptors";
import SpinnerPage from "../utils/spinner-page";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  csrfToken: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        csrfToken: action.payload.csrfToken,
        isAuthenticated: true,
        isLoading: false,
      };

    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "REFRESH_TOKEN":
      return {
        ...state,
        accessToken: action.payload.accessToken,
        csrfToken: action.payload.csrfToken,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };

    case "UPDATE_USER":
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    authRef.current = {
      accessToken: state.accessToken,
      csrfToken: state.csrfToken,
    };
  }, [state.accessToken, state.csrfToken]);

  useEffect(() => {
    authActionsRef.current = {
      refreshToken: (accessToken, csrfToken, user) =>
        dispatch({
          type: "REFRESH_TOKEN",
          payload: { accessToken, csrfToken, user },
        }),
      logout: () => dispatch({ type: "LOGOUT" }),
    };
  }, []);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const response = await refreshTokenRequest();

        dispatch({
          type: "REFRESH_TOKEN",
          payload: {
            accessToken: response.access_token,
            csrfToken: response.csrf_token,
            user: response.user,
          },
        });
      } catch {
        dispatch({ type: "LOGOUT" });
      }
    };

    checkExistingSession();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {state.isLoading ? <SpinnerPage /> : children}
    </AuthContext.Provider>
  );
}
