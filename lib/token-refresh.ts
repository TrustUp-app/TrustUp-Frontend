/**
 * Refresh token helper with single-flight queue.
 *
 * Prevents concurrent refresh requests by maintaining an in-flight promise.
 * If multiple requests trigger a refresh, only one request is made and all
 * requesters wait for the same result.
 *
 * See issue #60 for details on the refresh flow.
 */

import { getRefreshToken, setTokens, clearTokens } from './auth-storage';
import type { RefreshTokenResponse } from '../types/auth';
import { API_BASE_URL } from './api';

let refreshPromise: Promise<RefreshTokenResponse> | null = null;

/**
 * Refresh the access token using the stored refresh token.
 *
 * @throws {Error} if refresh fails (no stored refresh token, network error, 401, etc.)
 * @returns {Promise<RefreshTokenResponse>} the new access and refresh tokens
 */
export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  // If a refresh is already in flight, wait for it instead of making another request.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = performRefresh();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function performRefresh(): Promise<RefreshTokenResponse> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  // If the refresh token is invalid/expired, clear both tokens and fail.
  if (response.status === 401) {
    await clearTokens();
    throw new Error('Refresh token expired or invalid');
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${body}`);
  }

  const json = (await response.json()) as RefreshTokenResponse;

  // Persist the new token pair; refresh_token is optional (server may not rotate it).
  await setTokens(json.accessToken, json.refreshToken);

  return json;
}
