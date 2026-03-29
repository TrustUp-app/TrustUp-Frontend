/**
 * Secure token storage using expo-secure-store.
 *
 * expo-secure-store uses the iOS Keychain and Android Keystore under the hood,
 * which is the recommended approach for storing sensitive auth tokens in Expo
 * apps (never use AsyncStorage for tokens).
 *
 * Install if not already present:
 *   npx expo install expo-secure-store
 */

import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'trustup_access_token';
const REFRESH_TOKEN_KEY = 'trustup_refresh_token';

// ─── Access Token ────────────────────────────────────────────────────────────

export async function saveAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function deleteAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

// ─── Refresh Token ───────────────────────────────────────────────────────────

export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function deleteRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

// ─── Clear all auth tokens (e.g. on logout) ──────────────────────────────────

export async function clearTokens(): Promise<void> {
  await Promise.all([deleteAccessToken(), deleteRefreshToken()]);
}