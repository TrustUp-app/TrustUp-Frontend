import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage helpers for the authentication JWT.
 *
 * - Native (iOS/Android): `expo-secure-store` (Keychain / Keystore)
 * - Web: AsyncStorage fallback — SecureStore is not available in browsers
 */
const TOKEN_KEY = 'trustup.auth.token';

const isWeb = Platform.OS === 'web';

/** Returns the stored JWT, or `null` if the user is not authenticated. */
export const getToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
};

/** Persists the JWT securely (or via AsyncStorage on web). */
export const setToken = async (token: string): Promise<void> => {
  if (isWeb) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

/** Removes the JWT (used on sign out / wallet disconnect). */
export const clearToken = async (): Promise<void> => {
  if (isWeb) {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
