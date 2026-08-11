import { api } from "../apis/axios";
import type { User } from "../types/auth";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  csrf_token: string;
}

export interface RefreshResponse {
  access_token: string;
  csrf_token: string;
  user: User;
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return {
    ...response.data,
    csrf_token: response.headers["x-csrf-token"],
  };
}

export async function registerRequest(payload: RegisterPayload): Promise<User> {
  const response = await api.post<User>("/auth/register", payload);
  return response.data;
}

export async function logoutRequest(): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/logout");
  return response.data;
}

export async function refreshTokenRequest(): Promise<RefreshResponse> {
  const response = await api.post<{ access_token: string; user: User }>(
    "/auth/refresh-token",
  );
  const csrfToken = response.headers["x-csrf-token"];

  return {
    access_token: response.data.access_token,
    csrf_token: csrfToken,
    user: response.data.user,
  };
}

export async function resendActivationRequest(
  email: string,
): Promise<{ message: string }> {
  const response = await api.post("auth/resend-activation", { email: email });
  return response.data;
}

export async function activateAccountRequest(
  token: string,
): Promise<{ message: string }> {
  const response = await api.get(`auth/activate-account/${token}`);
  return response.data;
}
