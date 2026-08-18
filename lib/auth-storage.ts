import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage helpers for the authentication JWTs.
 *
 * - Native (iOS/Android): `expo-secure-store` (Keychain / Keystore)
 * - Web: AsyncStorage fallback — SecureStore is not available in browsers
 *
 * Two separate keys per the auth API contract: an access token (short-lived,
 * sent on every request) and a refresh token (longer-lived, used to mint a
 * new access token — refresh flow itself is not implemented yet, storage
 * only, see #60 follow-up).
 */
const ACCESS_TOKEN_KEY = 'trustup_access_token';
const REFRESH_TOKEN_KEY = 'trustup_refresh_token';

const isWeb = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  try {
    return isWeb ? await AsyncStorage.getItem(key) : await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const getAccessToken = (): Promise<string | null> => getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = (): Promise<string | null> => getItem(REFRESH_TOKEN_KEY);

/** Persists both tokens after a successful login/register. Refresh token is optional. */
export const setTokens = async (accessToken: string, refreshToken?: string): Promise<void> => {
  await setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) await setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/** Removes both tokens — used on sign out and on a 401 from any API call. */
export const clearTokens = async (): Promise<void> => {
  await removeItem(ACCESS_TOKEN_KEY);
  await removeItem(REFRESH_TOKEN_KEY);
};
