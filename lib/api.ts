import { getAccessToken, clearTokens } from './auth-storage';
import { notifyUnauthorized, setUnauthorizedHandler } from './auth-events';
import { refreshAuthToken, setTokenChangeHandler } from './auth-refresh';

export { setUnauthorizedHandler, setTokenChangeHandler };

export type FieldErrors = Record<string, string>;

/**
 * Base URL for the backend API, read from the public Expo env variable.
 * See `.env.example` for the expected value (already includes `/api/v1`).
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

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

/**
 * Best-effort extraction of per-field validation errors from a REST error
 * body. Covers three common shapes since the real backend contract isn't
 * documented anywhere in this repo: NestJS class-validator's default
 * `{ message: string[] }` (field name assumed to prefix each sentence),
 * `{ errors: { field: string | string[] } }`, and
 * `{ errors: [{ field | property, message }] }`. Returns undefined if none
 * match — callers fall back to the flat message.
 */
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

/**
 * Some TrustUp endpoints wrap payloads as `{ success, data, message }`.
 * Returns the inner `data` when present; otherwise the body as-is.
 */
export const unwrapApiData = <T>(body: unknown): T => {
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
};

/**
 * Thin fetch wrapper that prefixes {@link API_BASE_URL}, attaches the stored
 * Bearer token, and parses JSON responses.
 * If a 401 is encountered, it attempts a single token refresh using the stored refresh_token
 * and retries the request once before signaling sign-out on failure.
 *
 * @param knownFields Optional list of form field names — when present, the
 *   error body is inspected for per-field validation errors (see
 *   {@link parseFieldErrors}) and attached to the thrown ApiError.
 * @throws {ApiError} when the response status is not in the 2xx range.
 */
export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  knownFields?: string[],
  isRetry = false
): Promise<T> => {
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
    // Avoid refresh loops on login/register/refresh itself
    const isAuthEndpoint = path.startsWith('/auth/login') || path.startsWith('/auth/refresh');
    if (!isRetry && !isAuthEndpoint) {
      const refreshedToken = await refreshAuthToken(API_BASE_URL);
      if (refreshedToken) {
        return apiFetch<T>(path, options, knownFields, true);
      }
    }

    await clearTokens();
    notifyUnauthorized();
    throw new ApiError(401, 'Session expired. Please sign in again.');
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
};

/**
 * Variant of {@link apiFetch} for multipart/form-data bodies (e.g. register
 * with an optional profile image). Does not set Content-Type — fetch/RN sets
 * the multipart boundary automatically when the body is a FormData instance.
 *
 * @param knownFields Optional list of form field names for per-field error
 *   mapping, same as {@link apiFetch}.
 */
export const apiFetchForm = async <T>(
  path: string,
  formData: FormData,
  knownFields?: string[],
  isRetry = false
): Promise<T> => {
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
    const isAuthEndpoint = path.startsWith('/auth/login') || path.startsWith('/auth/refresh');
    if (!isRetry && !isAuthEndpoint) {
      const refreshedToken = await refreshAuthToken(API_BASE_URL);
      if (refreshedToken) {
        return apiFetchForm<T>(path, formData, knownFields, true);
      }
    }

    await clearTokens();
    notifyUnauthorized();
    throw new ApiError(401, 'Session expired. Please sign in again.');
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
