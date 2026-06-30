import * as SecureStore from 'expo-secure-store';

/**
 * Keys used for storing tokens in secure storage
 */
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'trustup_access_token',
  REFRESH_TOKEN: 'trustup_refresh_token',
} as const;

/**
 * Interface for stored authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Securely stores the access token
 * @param token - JWT access token
 */
export const setAccessToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.error('Failed to store access token:', error);
    throw new Error('Failed to store access token');
  }
};

/**
 * Securely stores the refresh token
 * @param token - JWT refresh token
 */
export const setRefreshToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.error('Failed to store refresh token:', error);
    throw new Error('Failed to store refresh token');
  }
};

/**
 * Stores both access and refresh tokens securely
 * @param tokens - Object containing both tokens
 */
export const setTokens = async (tokens: AuthTokens): Promise<void> => {
  try {
    await Promise.all([setAccessToken(tokens.accessToken), setRefreshToken(tokens.refreshToken)]);
  } catch (error) {
    console.error('Failed to store tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
};

/**
 * Retrieves the stored access token
 * @returns The access token or null if not found
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
};

/**
 * Retrieves the stored refresh token
 * @returns The refresh token or null if not found
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
};

/**
 * Retrieves both stored tokens
 * @returns Object with both tokens or null values if not found
 */
export const getTokens = async (): Promise<AuthTokens | null> => {
  try {
    const [accessToken, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Failed to retrieve tokens:', error);
    return null;
  }
};

/**
 * Removes the access token from secure storage
 */
export const clearAccessToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to clear access token:', error);
  }
};

/**
 * Removes the refresh token from secure storage
 */
export const clearRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to clear refresh token:', error);
  }
};

/**
 * Clears all stored authentication tokens
 * Used when logging out or when refresh token expires
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await Promise.all([clearAccessToken(), clearRefreshToken()]);
  } catch (error) {
    console.error('Failed to clear tokens:', error);
    throw new Error('Failed to clear authentication tokens');
  }
};

/**
 * Checks if the user has stored authentication tokens
 * @returns true if both tokens exist, false otherwise
 */
export const hasTokens = async (): Promise<boolean> => {
  try {
    const tokens = await getTokens();
    return tokens !== null;
  } catch (error) {
    console.error('Failed to check for tokens:', error);
    return false;
  }
};
