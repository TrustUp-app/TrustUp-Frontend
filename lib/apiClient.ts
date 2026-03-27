/**
 * Central HTTP client for TrustUp API
 * Base URL is read from EXPO_PUBLIC_API_URL (see docs/contributing.md)
 */

import { getAccessToken } from './tokenStorage';

const getBaseUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    throw new Error('EXPO_PUBLIC_API_URL is not defined. Add it to your .env file.');
  }
  // Strip trailing slash for safe path joining
  return url.replace(/\/$/, '');
};

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  /** Whether to attach the Authorization: Bearer header */
  authenticated?: boolean;
  body?: unknown;
}

/**
 * Generic API request helper.
 * Throws an ApiError for non-2xx responses so callers can catch and display
 * user-facing messages.
 */
export async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { authenticated = false, body } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authenticated) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody?.message ?? message;
    } catch {
      // Non-JSON error body — keep default message
    }
    throw new ApiError(message, response.status);
  }

  // 204 No Content — return undefined cast to T
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Typed API error that carries the HTTP status code so the UI can
 * distinguish between e.g. 401 Unauthorized and 500 Server Error.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}