import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './token-storage';
import { ApiError, RefreshTokenResponse } from '../types/api';

/**
 * Base URL for the API
 * Defaults to localhost for development
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Flag to prevent multiple concurrent token refresh requests
 */
let isRefreshing = false;

/**
 * Queue of failed requests waiting for token refresh
 */
let failedRequestsQueue: {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}[] = [];

/**
 * Processes queued requests after token refresh
 * @param error - Error if refresh failed, null if successful
 * @param token - New access token if refresh succeeded
 */
const processQueue = (error: Error | null, token: string | null = null): void => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedRequestsQueue = [];
};

/**
 * Creates and configures the Axios instance with interceptors
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Request interceptor: Adds authentication token to requests
   */
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAccessToken();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response interceptor: Handles 401 errors and token refresh
   */
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 Unauthorized errors
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              resolve: (token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(instance(originalRequest));
              },
              reject: (err: Error) => {
                reject(err);
              },
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await getRefreshToken();

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call refresh endpoint
          const response = await axios.post<RefreshTokenResponse>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          await setTokens({
            accessToken,
            refreshToken: newRefreshToken,
          });

          // Update authorization header for the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          // Process queued requests
          processQueue(null, accessToken);

          // Retry the original request
          return instance(originalRequest);
        } catch (refreshError) {
          // Token refresh failed - clear tokens and reject all queued requests
          processQueue(refreshError as Error, null);
          await clearTokens();

          // Redirect to sign in (in a React Native app, use navigation)
          console.error('Token refresh failed. User must sign in again.');

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // For other errors, just reject with formatted error
      const apiError: ApiError = {
        success: false,
        message: error.response?.data?.message || error.message || 'An error occurred',
        errors: error.response?.data?.errors,
        statusCode: error.response?.status,
      };

      return Promise.reject(apiError);
    }
  );

  return instance;
};

/**
 * Configured API client instance
 * Use this for all API calls
 */
export const apiClient = createApiClient();

/**
 * Helper function to handle API errors consistently
 * @param error - Error from API call
 * @returns Formatted error message
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error as AxiosError<ApiError>;
    return apiError.response?.data?.message || apiError.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Type guard to check if error is an API error
 * @param error - Error to check
 * @returns true if error is an ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    'message' in error &&
    error.success === false
  );
};
