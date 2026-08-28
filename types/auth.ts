/**
 * Type definitions for authentication API responses.
 */

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  expiresIn?: number;
}
