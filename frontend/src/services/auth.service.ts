import { api } from "@/lib/api";
import type { LoginResponse } from "@/types";

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName?: string;
    companyTaxId?: string;
  }) => api.post<LoginResponse & { company: { id: string; legalName: string } }>("/auth/register", data),

  refresh: (refreshToken: string) =>
    api.post<LoginResponse>("/auth/refresh", { refreshToken }),

  logout: (refreshToken?: string) =>
    api.post<void>("/auth/logout", { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post<void>("/auth/reset-password", { token, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<void>("/auth/change-password", { currentPassword, newPassword }),

  getProfile: () => api.get<Record<string, unknown>>("/auth/profile"),
};
