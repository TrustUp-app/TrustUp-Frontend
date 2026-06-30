import * as SecureStore from 'expo-secure-store';
import {
  setAccessToken,
  setRefreshToken,
  setTokens,
  getAccessToken,
  getTokens,
  clearTokens,
  hasTokens,
} from '../token-storage';

jest.mock('expo-secure-store');

describe('Token Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setAccessToken', () => {
    it('should store access token', async () => {
      await setAccessToken('test-access-token');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'trustup_access_token',
        'test-access-token'
      );
    });
  });

  describe('setRefreshToken', () => {
    it('should store refresh token', async () => {
      await setRefreshToken('test-refresh-token');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'trustup_refresh_token',
        'test-refresh-token'
      );
    });
  });

  describe('setTokens', () => {
    it('should store both tokens', async () => {
      await setTokens({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAccessToken', () => {
    it('should retrieve access token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-access-token');

      const token = await getAccessToken();

      expect(token).toBe('test-access-token');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('trustup_access_token');
    });

    it('should return null if token not found', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const token = await getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('getTokens', () => {
    it('should retrieve both tokens', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const tokens = await getTokens();

      expect(tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should return null if any token is missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce(null);

      const tokens = await getTokens();

      expect(tokens).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should delete both tokens', async () => {
      await clearTokens();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('trustup_access_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('trustup_refresh_token');
    });
  });

  describe('hasTokens', () => {
    it('should return true when both tokens exist', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await hasTokens();

      expect(result).toBe(true);
    });

    it('should return false when tokens are missing', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await hasTokens();

      expect(result).toBe(false);
    });
  });
});
