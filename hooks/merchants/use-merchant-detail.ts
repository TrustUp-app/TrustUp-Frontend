import { useState, useEffect, useCallback, useRef } from 'react';
import { getMerchantById } from '../../services/merchants.service';
import { ApiError } from '../../lib/api';
import type { MerchantDetail } from '../../types/api';

export interface UseMerchantDetailReturn {
  merchant: MerchantDetail | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook backing the Merchant Detail screen.
 * `GET /merchants/:id` (JWT).
 */
export const useMerchantDetail = (merchantId: string): UseMerchantDetailReturn => {
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
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
        const res = await getMerchantById(merchantId, signal);
        if (!isMountedRef.current || signal.aborted) return;
        setMerchant(res);
      } catch (err) {
        if (signal.aborted || !isMountedRef.current) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load merchant');
      } finally {
        if (isMountedRef.current && !signal.aborted) setIsLoading(false);
      }
    })();

    return () => {
      isMountedRef.current = false;
      controller.abort();
    };
  }, [merchantId, reloadKey]);

  return { merchant, isLoading, error, refresh };
};
