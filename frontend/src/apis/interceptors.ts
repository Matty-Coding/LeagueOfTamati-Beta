import { api } from "./axios";
import { refreshTokenRequest } from "../services/auth";
import type { User } from "../types/auth";

type AuthSnapshot = {
  accessToken: string | null;
  csrfToken: string | null;
};

type AuthActions = {
  refreshToken: (accessToken: string, csrfToken: string, user: User) => void;
  logout: () => void;
};

// change out of React life cycle
// updated in AuthProvider during the render
export const authRef: { current: AuthSnapshot } = {
  current: { accessToken: null, csrfToken: null },
};

export const authActionsRef: { current: AuthActions } = {
  current: {
    refreshToken: () => {},
    logout: () => {},
  },
};

api.interceptors.request.use((config) => {
  if (authRef.current.accessToken) {
    config.headers.Authorization = `Bearer ${authRef.current.accessToken}`;
  }
  if (authRef.current.csrfToken && !config.headers["x-csrf-token"]) {
    config.headers["x-csrf-token"] = authRef.current.csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        const response = await refreshTokenRequest();
        const newAccessToken = response.access_token;
        const newCsrfToken = response.csrf_token;

        authActionsRef.current.refreshToken(
          newAccessToken,
          newCsrfToken,
          response.user,
        );

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers["x-csrf-token"] = newCsrfToken;

        return api(originalRequest);
      } catch {
        authActionsRef.current.logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
