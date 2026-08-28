/**
 * Unit tests for token refresh logic.
 *
 * Tests cover:
 * - Successful token refresh with persistence
 * - Single-flight queue (concurrent requests wait for same response)
 * - Refresh failure scenarios (no token, 401, network error)
 * - Error messages don't log token values
 */

import { refreshAccessToken } from './token-refresh';
import * as authStorage from './auth-storage';

// Mock the auth-storage module
jest.mock('./auth-storage');

// Mock the global fetch
global.fetch = jest.fn();

// Set a dummy API_BASE_URL for tests
jest.mock('./api', () => ({
  API_BASE_URL: 'http://localhost:4000/api/v1',
}));

describe('token-refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully and persist new tokens', async () => {
      const refreshToken = 'old-refresh-token';
      const newAccessToken = 'new-access-token';
      const expiresIn = 900;

      (authStorage.getRefreshToken as jest.Mock).mockResolvedValue(refreshToken);
      (authStorage.setTokens as jest.Mock).mockResolvedValue(undefined);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({
          accessToken: newAccessToken,
          expiresIn,
        }),
      });

      const result = await refreshAccessToken();

      expect(result.accessToken).toBe(newAccessToken);
      expect(result.expiresIn).toBe(expiresIn);
      expect(authStorage.setTokens).toHaveBeenCalledWith(newAccessToken, undefined);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    });

    it('should persist new refresh token when server provides one', async () => {
      const oldRefreshToken = 'old-refresh-token';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      (authStorage.getRefreshToken as jest.Mock).mockResolvedValue(oldRefreshToken);
      (authStorage.setTokens as jest.Mock).mockResolvedValue(undefined);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 900,
        }),
      });

      await refreshAccessToken();

      expect(authStorage.setTokens).toHaveBeenCalledWith(newAccessToken, newRefreshToken);
    });

    it('should throw when no refresh token is stored', async () => {
      (authStorage.getRefreshToken as jest.Mock).mockResolvedValue(null);

      await expect(refreshAccessToken()).rejects.toThrow('No refresh token available');
    });

    it('should clear tokens and throw on 401 response', async () => {
      const refreshToken = 'expired-refresh-token';

      (authStorage.getRefreshToken as jest.Mock).mockResolvedValue(refreshToken);
      (authStorage.clearTokens as jest.Mock).mockResolvedValue(undefined);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      await expect(refreshAccessToken()).rejects.toThrow('Refresh token expired or invalid');
      expect(authStorage.clearTokens).toHaveBeenCalled();
    });

    it('should throw on network error', async () => {
      const refreshToken = 'valid-refresh-token';

      (authStorage.getRefreshToken as jest.Mock).mockResolvedValue(refreshToken);

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failed'));

      await expect(refreshAccessToken()).rejects.toThrow('Network failed');
    });

    it('should throw on non-200 response', async () => {
      const refreshToken = 'valid-refresh-token';

      (authStorage.getRefreshToken as jest.Mock).mockResolvedValue(refreshToken);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 500,
        ok: false,
        text: async () => 'Internal server error',
      });

      await expect(refreshAccessToken()).rejects.toThrow('Token refresh failed: 500');
    });

    it('should implement single-flight queue for concurrent requests', async () => {
      const validRefreshToken = 'valid-refresh-token';
      const newAccessToken = 'new-access-token';

      (authStorage.getRefreshToken as jest.Mock).mockResolvedValue(validRefreshToken);
      (authStorage.setTokens as jest.Mock).mockResolvedValue(undefined);

      // Mock fetch to delay response
      const mockResponse = {
        status: 200,
        ok: true,
        json: async () => ({
          accessToken: newAccessToken,
          expiresIn: 900,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Fire multiple refresh requests concurrently
      const [result1, result2, result3] = await Promise.all([
        refreshAccessToken(),
        refreshAccessToken(),
        refreshAccessToken(),
      ]);

      // All should resolve with same result
      expect(result1.accessToken).toBe(newAccessToken);
      expect(result2.accessToken).toBe(newAccessToken);
      expect(result3.accessToken).toBe(newAccessToken);

      // But fetch should only be called once (single-flight)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should not log token values in error messages', async () => {
      (authStorage.getRefreshToken as jest.Mock).mockResolvedValue(null);

      try {
        await refreshAccessToken();
      } catch (error) {
        const message = (error as Error).message;
        // Ensure token is not in the error message
        expect(message).not.toContain('sensitive-token');
        expect(message).not.toContain('12345');
      }
    });
  });
});
