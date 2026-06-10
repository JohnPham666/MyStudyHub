import { api, tokenStore } from "./client";

export interface AuthUser {
  id: string | number;
  username: string;
  email: string;
  fullName?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export async function loginRequest(input: { usernameOrEmail: string; password: string }) {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
  tokenStore.set(data.accessToken, data.refreshToken);
  return data.user;
}

export async function registerRequest(input: {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}) {
  const data = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: input,
    auth: false,
  });
  tokenStore.set(data.accessToken, data.refreshToken);
  return data.user;
}

export async function fetchMe() {
  return api<AuthUser>("/auth/me");
}

export function logoutLocal() {
  tokenStore.clear();
}
