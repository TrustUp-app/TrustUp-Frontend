import { useState, useEffect, useCallback, useRef } from 'react';
import { listMerchants } from '../../services/merchants.service';
import { ApiClientError } from '../../lib/api-client';
import type { MerchantSummary } from '../../types/api';

export interface UseMerchantsReturn {
  merchants: MerchantSummary[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook backing the Merchants listing screen.
 * `GET /merchants` (JWT). When the list is empty (or the endpoint is not yet
 * available) the screen shows a "coming soon" state.
 */
export const useMerchants = (): UseMerchantsReturn => {
  const [merchants, setMerchants] = useState<MerchantSummary[]>([]);
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
        const res = await listMerchants({ signal });
        if (!isMountedRef.current || signal.aborted) return;
        setMerchants(res.merchants);
      } catch (err) {
        if (signal.aborted || !isMountedRef.current) return;
        setError(err instanceof ApiClientError ? err.message : 'Failed to load merchants');
      } finally {
        if (isMountedRef.current && !signal.aborted) setIsLoading(false);
      }
    })();

    return () => {
      isMountedRef.current = false;
      controller.abort();
    };
  }, [reloadKey]);

  return { merchants, isLoading, error, refresh };
};
