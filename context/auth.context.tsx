import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, ApiError, setUnauthorizedHandler } from '../lib/api';
import { getAccessToken, setTokens, clearTokens } from '../lib/auth-storage';
import { mapUserMeToProfile, type UserMeApiResponse, type UserProfile } from '../types/User';

/** Shape returned by both POST /auth/login and (assumed) POST /auth/register. */
interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: UserMeApiResponse;
}

export interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  signIn: (wallet: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * For flows (e.g. register) that receive an AuthResponse directly from
   * their own API call and should adopt the session without a second
   * /auth/login round trip.
   */
  completeAuth: (response: AuthResponse) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(async () => {
    await clearTokens();
    setUser(null);
    setToken(null);
  }, []);

  const completeAuth = useCallback(async (response: AuthResponse) => {
    await setTokens(response.access_token, response.refresh_token);
    setToken(response.access_token);
    setUser(mapUserMeToProfile(response.user));
  }, []);

  const signIn = useCallback(
    async (wallet: string, password: string) => {
      const response = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ wallet, password }),
      });
      await completeAuth(response);
    },
    [completeAuth]
  );

  // Restore session on mount: is there a stored access token? If so, treat
  // the user as logged in optimistically and fetch the real profile to
  // confirm the token is still valid (an invalid one 401s -> signOut via the
  // unauthorized handler below).
  useEffect(() => {
    (async () => {
      const stored = await getAccessToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      setToken(stored);
      try {
        const me = await apiFetch<UserMeApiResponse>('/users/me');
        setUser(mapUserMeToProfile(me));
      } catch (err) {
        // 401 already triggers signOut via the unauthorized handler; any
        // other error (network down, etc.) — keep the token, let the user
        // in, and let individual screens surface their own fetch errors.
        if (err instanceof ApiError && err.status !== 401) {
          // network/server hiccup, not an auth problem — stay signed in
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Wire apiFetch's 401 handler to this context's signOut, once.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, signIn, signOut, completeAuth }),
    [user, token, isLoading, signIn, signOut, completeAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth() must be used inside <AuthProvider>.');
  return ctx;
}
