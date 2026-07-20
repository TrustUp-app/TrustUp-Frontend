import { getAccessToken } from './token-storage';

/**
 * Thin HTTP client for the TrustUp API.
 *
 * - Base URL comes from `EXPO_PUBLIC_API_URL` (default `http://localhost:4000`),
 *   with `/api/v1` appended automatically (per the frontend .env convention).
 * - Attaches the JWT Bearer token from `token-storage` when present.
 * - Throws `ApiClientError` on non-2xx with the backend's message when available.
 *
 * @todo This mirrors the intent of the (unmerged) API-client PR. Once the
 *   official client lands, the services can be pointed at it instead.
 */

const RAW_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';
export const API_BASE_URL = `${RAW_BASE.replace(/\/+$/, '')}/api/v1`;

/** True when a real API base URL was explicitly configured. */
export const isApiConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL);

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
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
  method: 'GET' | 'POST',
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
};
