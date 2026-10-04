import { api } from './client';
import { User } from './types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
  verificationToken?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  phoneNumber?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }),

  logout: (refreshToken?: string) =>
    api.post<{ message: string }>('/auth/logout', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<{ message: string; resetToken?: string }>('/auth/forgot-password', { email }),

  resetPassword: (payload: { token: string; newPassword: string }) =>
    api.post<{ message: string }>('/auth/reset-password', payload),

  verifyEmail: (token: string) =>
    api.post<{ message: string }>('/auth/verify-email', { token }),
};
