import { EXPO_PUBLIC_API_URL } from '../constants/env';
import { getAccessToken } from '../auth/tokenStore';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function buildHeaders(extraHeaders?: Record<string, string>) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders ?? {}),
  };

  const token = await getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return `${base}${path}`;
}

export async function httpRequest<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = joinUrl(EXPO_PUBLIC_API_URL, path);

  const headers = await buildHeaders(extraHeaders);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    throw new ApiError('Network error. Please check your connection.', undefined, e);
  }

  if (!response.ok) {
    let details: unknown = undefined;
    try {
      details = await response.json();
    } catch {
      // ignore
    }

    const message =
      typeof details === 'object' && details && 'message' in (details as any)
        ? String((details as any).message)
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, details);
  }

  const text = await response.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}



