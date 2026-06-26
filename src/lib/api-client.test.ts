/**
 * Unit tests for api-client interceptor logic.
 *
 * Strategy: build a minimal in-process Axios instance wired with the same
 * interceptors as api-client, backed by a mock adapter, so we can assert on
 * header attachment and 401-refresh behaviour without network I/O.
 */
import axios, {
  AxiosAdapter,
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// ─── token-storage mock ──────────────────────────────────────────────────────
const mockStorage: Record<string, string | null> = {
  trustup_access_token: null,
  trustup_refresh_token: null,
};

const tokenStorage = {
  getAccessToken: jest.fn(() => Promise.resolve(mockStorage.trustup_access_token)),
  setAccessToken: jest.fn((t: string) => {
    mockStorage.trustup_access_token = t;
    return Promise.resolve();
  }),
  getRefreshToken: jest.fn(() => Promise.resolve(mockStorage.trustup_refresh_token)),
  setRefreshToken: jest.fn((t: string) => {
    mockStorage.trustup_refresh_token = t;
    return Promise.resolve();
  }),
  clearTokens: jest.fn(() => {
    mockStorage.trustup_access_token = null;
    mockStorage.trustup_refresh_token = null;
    return Promise.resolve([undefined, undefined]);
  }),
};

type MockAdapter = jest.Mock<Promise<AxiosResponse>, [InternalAxiosRequestConfig]>;

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Creates a fresh Axios instance with the same interceptor logic as api-client,
 * but with an injectable adapter so we can mock network calls.
 */
function buildClient(adapter: MockAdapter): {
  client: AxiosInstance;
  refreshSpy: jest.Mock;
} {
  const BASE_URL = 'http://localhost:4000/api/v1';
  const client = axios.create({ baseURL: BASE_URL, adapter: adapter as unknown as AxiosAdapter });

  // Request interceptor (mirrors api-client.ts)
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  const refreshSpy = jest.fn();

  // Response interceptor (mirrors api-client.ts)
  let isRefreshing = false;
  let refreshQueue: Array<(token: string) => void> = [];

  function drainQueue(token: string) {
    refreshQueue.forEach((resolve) => resolve(token));
    refreshQueue = [];
  }

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status !== 401 || original._retry) {
        return Promise.reject(error);
      }

      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken: string) => {
            if (newToken) {
              original.headers.set('Authorization', `Bearer ${newToken}`);
              resolve(client(original));
            } else {
              reject(new Error('Session expired'));
            }
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        refreshSpy(refreshToken);

        const refreshResponse = await adapter({
          url: `${BASE_URL}/auth/refresh`,
          method: 'post',
          data: { refreshToken },
          headers: new AxiosHeaders(),
        } as InternalAxiosRequestConfig);
        const newAccessToken = (refreshResponse.data as { accessToken: string }).accessToken;

        await tokenStorage.setAccessToken(newAccessToken);
        drainQueue(newAccessToken);
        original.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return client(original);
      } catch {
        await tokenStorage.clearTokens();
        drainQueue('');
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return { client, refreshSpy };
}

function makeOkResponse(data: unknown, config: InternalAxiosRequestConfig): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config };
}

function make401Error(config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError('Unauthorized', '401', config, null, {
    data: {},
    status: 401,
    statusText: 'Unauthorized',
    headers: new AxiosHeaders(),
    config,
  });
}

// ─── tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.trustup_access_token = null;
  mockStorage.trustup_refresh_token = null;
});

describe('request interceptor', () => {
  it('attaches Authorization header when access token exists', async () => {
    mockStorage.trustup_access_token = 'access-abc';
    let capturedAuth: string | null = null;

    const adapter: MockAdapter = jest.fn(async (config) => {
      capturedAuth = config.headers.get('Authorization') as string | null;
      return makeOkResponse({}, config);
    });

    const { client } = buildClient(adapter);
    await client.get('/any');

    expect(capturedAuth).toBe('Bearer access-abc');
  });

  it('does not attach Authorization header when no token', async () => {
    let capturedAuth: string | null = null;

    const adapter: MockAdapter = jest.fn(async (config) => {
      capturedAuth = config.headers.get('Authorization') as string | null;
      return makeOkResponse({}, config);
    });

    const { client } = buildClient(adapter);
    await client.get('/any');

    expect(capturedAuth).toBeFalsy();
  });
});

describe('response interceptor — 401 handling', () => {
  it('refreshes token and retries the original request on 401', async () => {
    mockStorage.trustup_access_token = 'old-access';
    mockStorage.trustup_refresh_token = 'valid-refresh';

    let callCount = 0;

    const adapter: MockAdapter = jest.fn(async (config) => {
      if ((config.url ?? '').includes('/auth/refresh')) {
        return makeOkResponse({ accessToken: 'new-access' }, config);
      }

      callCount += 1;
      if (callCount === 1) throw make401Error(config);

      return makeOkResponse({ authHeader: config.headers.get('Authorization') }, config);
    });

    const { client, refreshSpy } = buildClient(adapter);
    const res = await client.get('/protected');

    expect(refreshSpy).toHaveBeenCalledWith('valid-refresh');
    expect(tokenStorage.setAccessToken).toHaveBeenCalledWith('new-access');
    expect(res.data.authHeader).toBe('Bearer new-access');
  });

  it('clears tokens when refresh fails', async () => {
    mockStorage.trustup_access_token = 'old-access';
    mockStorage.trustup_refresh_token = 'expired-refresh';

    const adapter: MockAdapter = jest.fn(async (config) => {
      throw make401Error(config);
    });

    const { client } = buildClient(adapter);
    await expect(client.get('/protected')).rejects.toThrow();
    expect(tokenStorage.clearTokens).toHaveBeenCalled();
  });

  it('does not retry when _retry is already set', async () => {
    mockStorage.trustup_access_token = 'token';
    mockStorage.trustup_refresh_token = 'refresh';

    const adapter: MockAdapter = jest.fn(async (config) => {
      throw make401Error(config);
    });

    const { client } = buildClient(adapter);
    await expect(client.get('/protected')).rejects.toMatchObject({ response: { status: 401 } });
    expect(adapter.mock.calls.length).toBeLessThanOrEqual(3);
  });

  it('passes through non-401 errors without attempting refresh', async () => {
    const adapter: MockAdapter = jest.fn(async (config) => {
      throw new AxiosError('Not Found', '404', config, null, {
        data: {},
        status: 404,
        statusText: 'Not Found',
        headers: new AxiosHeaders(),
        config,
      });
    });

    const { client, refreshSpy } = buildClient(adapter);
    await expect(client.get('/missing')).rejects.toMatchObject({ response: { status: 404 } });
    expect(refreshSpy).not.toHaveBeenCalled();
    expect(tokenStorage.clearTokens).not.toHaveBeenCalled();
  });
});
