import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './token-storage';

export const BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000') + '/api/v1';

export const apiClient = axios.create({ baseURL: BASE_URL });

// Attach Authorization header on every request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Flag to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function drainQueue(token: string) {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
}

// Handle 401: refresh token, retry original request; on failure clear storage
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      // Wait for the in-flight refresh to complete
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken: string) => {
          original.headers.set('Authorization', `Bearer ${newToken}`);
          resolve(apiClient(original));
        });
        // On refresh failure the queue will be drained by the finally block below
        // so we add a rejection path too
        const originalReject = refreshQueue[refreshQueue.length - 1];
        refreshQueue[refreshQueue.length - 1] = (token: string) => {
          if (token) originalReject(token);
          else reject(new Error('Session expired'));
        };
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post<{ accessToken: string }>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      await tokenStorage.setAccessToken(data.accessToken);
      drainQueue(data.accessToken);
      original.headers.set('Authorization', `Bearer ${data.accessToken}`);
      return apiClient(original);
    } catch {
      await tokenStorage.clearTokens();
      drainQueue('');
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);
