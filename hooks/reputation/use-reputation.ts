import { useState, useEffect, useCallback, useRef } from 'react';
import { getMyReputation } from '../../services/reputation.service';
import { ApiClientError } from '../../lib/api-client';
import type { ReputationResponse, ReputationTier } from '../../types/api';

/** Human-readable label for each backend tier. */
export const REPUTATION_TIER_LABELS: Record<ReputationTier, string> = {
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
  poor: 'Needs work',
};

export interface UseReputationReturn {
  reputation: ReputationResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook backing the Reputation detail screen.
 * `GET /reputation/me` (JWT). The backend returns score, tier, interestRate,
 * maxCredit and lastUpdated — there is NO score history or per-category
 * breakdown, so the screen renders neutral states for those (no invented data).
 */
export const useReputation = (): UseReputationReturn => {
  const [reputation, setReputation] = useState<ReputationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isMountedRef = useRef(true);
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    isMountedRef.current = true;
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMyReputation(signal);
        if (!isMountedRef.current || signal.aborted) return;
        setReputation(data);
      } catch (err) {
        if (signal.aborted || !isMountedRef.current) return;
        setError(err instanceof ApiClientError ? err.message : 'Failed to load reputation');
      } finally {
        if (isMountedRef.current && !signal.aborted) setIsLoading(false);
      }
    })();

    return () => {
      isMountedRef.current = false;
      controller.abort();
    };
  }, [reloadKey]);

  return { reputation, isLoading, error, refresh };
};
