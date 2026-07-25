import { useState, useEffect, useCallback, useRef } from 'react';
import { listMerchants } from '../../services/merchants.service';
import { ApiClientError } from '../../lib/api-client';
import type { MerchantSummary } from '../../types/api';

const PAGE_SIZE = 20;

export interface UseMerchantsReturn {
  merchants: MerchantSummary[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  query: string;
  setQuery: (query: string) => void;
  loadMore: () => void;
  refresh: () => void;
}

/**
 * Custom hook backing the Merchants listing screen.
 * Paginates `GET /merchants?limit=20&offset=N` (JWT). The backend has no
 * search parameter, so `query` filters by name over the merchants loaded
 * so far — scrolling further (`loadMore`) still fetches more candidates.
 */
export const useMerchants = (): UseMerchantsReturn => {
  const [rawMerchants, setRawMerchants] = useState<MerchantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const isMountedRef = useRef(true);
  const offsetRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(async (pageOffset: number, append: boolean) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const res = await listMerchants({
        limit: PAGE_SIZE,
        offset: pageOffset,
        signal: controller.signal,
      });
      if (!isMountedRef.current || controller.signal.aborted) return;
      setRawMerchants((prev) => (append ? [...prev, ...res.merchants] : res.merchants));
      offsetRef.current = pageOffset + res.merchants.length;
      setHasMore(pageOffset + res.merchants.length < res.total);
    } catch (err) {
      if (controller.signal.aborted || !isMountedRef.current) return;
      setError(err instanceof ApiClientError ? err.message : 'Failed to load merchants');
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    offsetRef.current = 0;
    fetchPage(0, false);
    return () => {
      isMountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [fetchPage, reloadKey]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchPage(offsetRef.current, true);
  }, [isLoading, hasMore, fetchPage]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const trimmedQuery = query.trim().toLowerCase();
  const merchants = trimmedQuery
    ? rawMerchants.filter((m) => m.name.toLowerCase().includes(trimmedQuery))
    : rawMerchants;

  return { merchants, isLoading, error, hasMore, query, setQuery, loadMore, refresh };
};
