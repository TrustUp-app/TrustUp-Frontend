import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { clearToken } from '../../lib/auth-storage';
import { mapUserMeToProfile, type UserMeApiResponse, type UserProfile } from '../../types/User';

/**
 * Return type for the {@link useProfile} hook.
 */
export interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  /** Clears the stored auth token (disconnect wallet / sign out). */
  disconnectWallet: () => Promise<void>;
  /** Optimistically merges fields into the current profile (e.g. after edit). */
  updateLocal: (partial: Partial<UserProfile>) => void;
  /** Persists profile edits via `PATCH /users/me`, then refreshes local state. */
  saveProfile: (changes: { displayName: string; username: string }) => Promise<void>;
}

/**
 * Truncates a Stellar wallet address to `GABC…WXYZ` (first 4 + last 4 chars).
 */
export const truncateWallet = (address: string): string => {
  if (!address || address.length <= 8) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
};

/**
 * Derives up to two uppercase initials from a display name.
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

/**
 * Fetches and manages the authenticated user's profile from `GET /users/me`.
 */
export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<UserMeApiResponse>('/users/me');
      setProfile(mapUserMeToProfile(data));
    } catch (err) {
      setProfile(null);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const disconnectWallet = useCallback(async () => {
    await clearToken();
    setProfile(null);
  }, []);

  const updateLocal = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const saveProfile = useCallback(async (changes: { displayName: string; username: string }) => {
    // API docs use `name`; also send displayName/username for forward compatibility.
    const updated = await apiFetch<UserMeApiResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        name: changes.displayName,
        displayName: changes.displayName,
        username: changes.username,
      }),
    });
    setProfile(mapUserMeToProfile({ ...updated, ...changes }));
  }, []);

  return {
    profile,
    isLoading,
    error,
    refresh: fetchProfile,
    disconnectWallet,
    updateLocal,
    saveProfile,
  };
};
