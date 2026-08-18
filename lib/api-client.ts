/**
 * Re-export the unified HTTP client from lib/api.ts for backwards compatibility.
 */
export {
  API_BASE_URL,
  isApiConfigured,
  resolveApiBaseUrl,
  ApiError,
  ApiClientError,
  apiFetch,
  apiClient,
  unwrapApiData,
  setUnauthorizedHandler,
  type FieldErrors,
  type RequestOptions,
} from './api';

export default {
  get: import('./api').then((m) => m.apiClient.get),
  post: import('./api').then((m) => m.apiClient.post),
  put: import('./api').then((m) => m.apiClient.put),
  patch: import('./api').then((m) => m.apiClient.patch),
  delete: import('./api').then((m) => m.apiClient.delete),
};
