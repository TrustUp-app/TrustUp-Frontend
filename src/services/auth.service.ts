import { apiClient } from '../lib/api-client';

export interface NonceResponse {
  nonce: string;
  expiresAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface UserProfile {
  wallet: string;
  name: string;
  avatar: string;
  preferences: {
    notifications: boolean;
    theme: string;
    language: string;
  };
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  preferences?: Partial<UserProfile['preferences']>;
}

export const authService = {
  getNonce: (wallet: string) =>
    apiClient.post<NonceResponse>('/auth/nonce', { wallet }).then((r) => r.data),

  verify: (wallet: string, signature: string, nonce: string) =>
    apiClient.post<AuthTokens>('/auth/verify', { wallet, signature, nonce }).then((r) => r.data),

  getMe: () =>
    apiClient.get<{ success: boolean; data: UserProfile }>('/users/me').then((r) => r.data.data),

  updateMe: (body: UpdateProfileRequest) =>
    apiClient.patch<UserProfile>('/users/me', body).then((r) => r.data),
};
