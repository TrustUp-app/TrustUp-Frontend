import { getRefreshToken, setTokens, clearTokens } from './auth-storage';
import { notifyUnauthorized } from './auth-events';

export interface RefreshResponse {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
}

let inFlightRefresh: Promise<string | null> | null = null;
let tokenChangeHandler: ((newToken: string) => void) | null = null;

export const setTokenChangeHandler = (handler: ((newToken: string) => void) | null): void => {
  tokenChangeHandler = handler;
};

export const notifyTokenChanged = (newToken: string): void => {
  tokenChangeHandler?.(newToken);
};

/**
 * Attempts a single in-flight token refresh using the stored refresh token.
 * Returns the new access token on success, or null on failure (clearing tokens and notifying unauthorized).
 */
export async function refreshAuthToken(apiBaseUrl: string): Promise<string | null> {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        await clearTokens();
        notifyUnauthorized();
        return null;
      }

      const cleanBase = (apiBaseUrl || '').replace(/\/+$/, '');
      if (!cleanBase) {
        await clearTokens();
        notifyUnauthorized();
        return null;
      }

      // If cleanBase already contains /api/v1 (e.g. from EXPO_PUBLIC_API_URL), use cleanBase + /auth/refresh
      // Otherwise append /auth/refresh directly.
      const url = `${cleanBase}/auth/refresh`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        await clearTokens();
        notifyUnauthorized();
        return null;
      }

      const json = (await response.json()) as RefreshResponse | { data?: RefreshResponse };
      const data: RefreshResponse =
        json && typeof json === 'object' && 'data' in json && json.data
          ? json.data
          : (json as RefreshResponse);

      const newAccessToken = data.accessToken || data.access_token;
      const newRefreshToken = data.refreshToken || data.refresh_token || refreshToken;

      if (!newAccessToken) {
        await clearTokens();
        notifyUnauthorized();
        return null;
      }

      await setTokens(newAccessToken, newRefreshToken);
      notifyTokenChanged(newAccessToken);
      return newAccessToken;
    } catch {
      await clearTokens();
      notifyUnauthorized();
      return null;
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
}
