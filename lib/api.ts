import { getAccessToken, clearTokens } from './auth-storage';
import { notifyUnauthorized, setUnauthorizedHandler } from './auth-events';
import { refreshAccessToken } from './token-refresh';

export { setUnauthorizedHandler };

export type FieldErrors = Record<string, string>;

const RAW_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';
const NORMALIZED_BASE = RAW_BASE.replace(/\/+$/, '');
export const API_BASE_URL = NORMALIZED_BASE.endsWith('/api/v1')
  ? NORMALIZED_BASE
  : `${NORMALIZED_BASE}/api/v1`;

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

export interface ApiRequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
}

function parseFieldErrors(body: unknown, knownFields: string[]): FieldErrors | undefined {
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

export const unwrapApiData = <T>(body: unknown): T => {
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  knownFields?: string[]
): Promise<T> => {
  return apiFetchInternal<T>(path, options, knownFields, false);
};

async function apiFetchInternal<T>(
  path: string,
  options: RequestInit,
  knownFields: string[] | undefined,
  isRetry: boolean
): Promise<T> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!API_BASE_URL) {
    throw new ApiError(0, 'EXPO_PUBLIC_API_URL is not configured');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    // On 401, try to refresh the token once. If this is a retry, don't try again.
    if (!isRetry) {
      try {
        await refreshAccessToken();
        // Refresh succeeded; retry the original request with the new token.
        return apiFetchInternal<T>(path, options, knownFields, true);
      } catch {
        // Refresh failed; clear tokens and sign out.
        await clearTokens();
        notifyUnauthorized();
        throw new ApiError(401, 'Session expired. Please sign in again.');
      }
    } else {
      // Already retried; don't loop.
      await clearTokens();
      notifyUnauthorized();
      throw new ApiError(401, 'Session expired. Please sign in again.');
    }
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let fieldErrors: FieldErrors | undefined;
    try {
      const body = await response.json();
      if (typeof body?.message === 'string') {
        message = body.message;
      } else if (Array.isArray(body?.message)) {
        message = body.message.join(', ');
      }
      fieldErrors = parseFieldErrors(body, knownFields ?? []);
    } catch {
      // Non-JSON error body; keep the default message.
    }
    throw new ApiError(response.status, message, fieldErrors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();
  return unwrapApiData<T>(json);
}

export const apiFetchForm = async <T>(
  path: string,
  formData: FormData,
  knownFields?: string[]
): Promise<T> => {
  return apiFetchFormInternal<T>(path, formData, knownFields, false);
};

async function apiFetchFormInternal<T>(
  path: string,
  formData: FormData,
  knownFields: string[] | undefined,
  isRetry: boolean
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  if (!API_BASE_URL) {
    throw new ApiError(0, 'EXPO_PUBLIC_API_URL is not configured');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401) {
    // On 401, try to refresh the token once. If this is a retry, don't try again.
    if (!isRetry) {
      try {
        await refreshAccessToken();
        // Refresh succeeded; retry the original request with the new token.
        return apiFetchFormInternal<T>(path, formData, knownFields, true);
      } catch {
        // Refresh failed; clear tokens and sign out.
        await clearTokens();
        notifyUnauthorized();
        throw new ApiError(401, 'Session expired. Please sign in again.');
      }
    } else {
      // Already retried; don't loop.
      await clearTokens();
      notifyUnauthorized();
      throw new ApiError(401, 'Session expired. Please sign in again.');
    }
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let fieldErrors: FieldErrors | undefined;
    try {
      const body = await response.json();
      if (typeof body?.message === 'string') message = body.message;
      else if (Array.isArray(body?.message)) message = body.message.join(', ');
      fieldErrors = parseFieldErrors(body, knownFields ?? []);
    } catch {
      // keep default message
    }
    throw new ApiError(response.status, message, fieldErrors);
  }

  const json = await response.json();
  return unwrapApiData<T>(json);
};

function buildQueryString(
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export const apiClient = {
  get: async <T>(path: string, options?: ApiRequestOptions): Promise<T> => {
    const queryString = buildQueryString(options?.params);
    return apiFetch<T>(`${path}${queryString}`, { signal: options?.signal });
  },
  post: async <T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> => {
    return apiFetch<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });
  },
};
