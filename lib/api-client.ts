import { getToken as getAccessToken, clearToken } from './token-storage';
import { notifyUnauthorized } from './auth-events';
import { FieldErrors } from './api';
/**
 * Thin HTTP client for the TrustUp API.
 *
 * - Base URL comes from `EXPO_PUBLIC_API_URL` (default `http://localhost:4000`),
 *   with `/api/v1` appended automatically (per the frontend .env convention).
 * - Attaches the JWT Bearer token from `token-storage` when present.
 * - Throws `ApiClientError` on non-2xx with the backend's message when available.
 *
 * NOTE: this is the pre-existing client for reputation/merchants/loans/pay.
 * The auth flow (#60) uses lib/api.ts instead. See lib/token-storage.ts for
 * why both point at the same underlying token.
 */

const RAW_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';
export const API_BASE_URL = `${RAW_BASE.replace(/\/+$/, '')}/api/v1`;

/** True when a real API base URL was explicitly configured. */
export const isApiConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL);

export class ApiClientError extends Error {
  status: number;
  fieldErrors?: FieldErrors;
  constructor(message: string, status: number, fieldErrors?: FieldErrors) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions {
  /** Query params appended to the URL (undefined/null values are skipped). */
  params?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(
  method: 'GET' | 'POST' | 'PATCH',
  path: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, options?.params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiClientError(message, 0);
  }

  if (res.status === 401) {
    await clearToken();
    notifyUnauthorized();
    throw new ApiClientError('Session expired. Please sign in again.', 401);
  }

  const text = await res.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : null) ?? `Request failed with status ${res.status}`;
    throw new ApiClientError(message, res.status);
  }

  return payload as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
};
