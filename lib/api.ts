import { getAccessToken, clearTokens } from './auth-storage';
import { notifyUnauthorized, setUnauthorizedHandler } from './auth-events';

export { setUnauthorizedHandler };

export type FieldErrors = Record<string, string>;

/**
 * Normalizes the API base URL from EXPO_PUBLIC_API_URL.
 * Handles URLs with or without trailing slash and with or without /api/v1 suffix.
 */
export function resolveApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:4000';
  const clean = raw.replace(/\/+$/, '');
  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
}

export const API_BASE_URL = resolveApiBaseUrl();

/** True when a real API base URL was explicitly configured. */
export const isApiConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL);

export class ApiError extends Error {
  status: number;
  fieldErrors?: FieldErrors;

  constructor(status: number, message: string, fieldErrors?: FieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export class ApiClientError extends ApiError {
  constructor(message: string, status: number, fieldErrors?: FieldErrors) {
    super(status, message, fieldErrors);
    this.name = 'ApiClientError';
  }
}

/**
 * Best-effort extraction of per-field validation errors from a REST error body.
 */
export function parseFieldErrors(body: unknown, knownFields: string[]): FieldErrors | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const result: FieldErrors = {};

  const maybeErrors = (body as { errors?: unknown }).errors;

  if (maybeErrors && typeof maybeErrors === 'object' && !Array.isArray(maybeErrors)) {
    for (const [key, value] of Object.entries(maybeErrors as Record<string, unknown>)) {
      if (knownFields.includes(key)) {
        result[key] = Array.isArray(value) ? String(value[0]) : String(value);
      }
    }
  }

  if (Array.isArray(maybeErrors)) {
    for (const item of maybeErrors) {
      if (!item || typeof item !== 'object') continue;
      const field =
        (item as { field?: unknown; property?: unknown }).field ??
        (item as { property?: unknown }).property;
      const constraints = (item as { constraints?: Record<string, string> }).constraints;
      const message =
        (item as { message?: unknown }).message ??
        (constraints ? Object.values(constraints)[0] : undefined);
      if (typeof field === 'string' && knownFields.includes(field) && message) {
        result[field] = String(message);
      }
    }
  }

  const message = (body as { message?: unknown }).message;
  if (Array.isArray(message)) {
    for (const entry of message) {
      if (typeof entry !== 'string') continue;
      const field = knownFields.find((f) => entry.startsWith(f));
      if (field) result[field] = entry;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Unwraps `{ success, data, message }` responses.
 */
export const unwrapApiData = <T>(body: unknown): T => {
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
};

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  knownFields?: string[];
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = resolveApiBaseUrl();
  const url = new URL(`${baseUrl}${normalizedPath}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Unified fetch client for TrustUp API.
 */
export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  knownFields?: string[]
): Promise<T> => {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const fullUrl = path.startsWith('http://') || path.startsWith('https://') ? path : buildUrl(path);

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(0, message);
  }

  if (res.status === 401) {
    await clearTokens();
    notifyUnauthorized();
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }

  const text = await res.text();
  const body = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const fieldErrors = knownFields ? parseFieldErrors(body, knownFields) : undefined;
    const message =
      (body && typeof body === 'object' && 'message' in body
        ? Array.isArray((body as { message: unknown }).message)
          ? (body as { message: string[] }).message.join('; ')
          : String((body as { message: unknown }).message)
        : null) ?? `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, fieldErrors);
  }

  return body as T;
};

/**
 * Convenience wrapper for multipart/form-data POST requests.
 */
export const apiFetchForm = async <T>(
  path: string,
  formData: FormData,
  knownFields?: string[]
): Promise<T> => {
  return apiFetch<T>(
    path,
    {
      method: 'POST',
      body: formData as unknown as BodyInit,
    },
    knownFields
  );
};

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * HTTP client convenience methods for GET, POST, PUT, DELETE, PATCH.
 */
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions): Promise<T> =>
    apiFetch<T>(
      path,
      { method: 'GET', signal: options?.signal, headers: options?.headers },
      options?.knownFields
    ),

  post: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    apiFetch<T>(
      path,
      {
        method: 'POST',
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal,
        headers: options?.headers,
      },
      options?.knownFields
    ),

  put: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    apiFetch<T>(
      path,
      {
        method: 'PUT',
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal,
        headers: options?.headers,
      },
      options?.knownFields
    ),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    apiFetch<T>(
      path,
      {
        method: 'PATCH',
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal,
        headers: options?.headers,
      },
      options?.knownFields
    ),

  delete: <T>(path: string, options?: RequestOptions): Promise<T> =>
    apiFetch<T>(
      path,
      { method: 'DELETE', signal: options?.signal, headers: options?.headers },
      options?.knownFields
    ),
};
