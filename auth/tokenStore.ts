import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'trustup_access_token';
const REFRESH_TOKEN_KEY = 'trustup_refresh_token';

export async function setTokens(params: {
  accessToken: string;
  refreshToken?: string;
}): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, params.accessToken);
  if (params.refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, params.refreshToken);
  }
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}



