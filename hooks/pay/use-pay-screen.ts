import { useState, useEffect, useCallback, useRef } from 'react';
import { getMyReputation } from '../../services/reputation.service';
import { getAvailableCredit, getMyLoans } from '../../services/loans.service';
import { ApiClientError } from '../../lib/api-client';
import type { LoanListItem, LoanNextPayment, ReputationTier } from '../../types/api';

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * Minimum reputation score required to be eligible for BNPL.
 * Below this the Pay screen shows a "Not eligible yet" state.
 */
export const MIN_ELIGIBLE_SCORE = 40;

// ─── Utilities ──────────────────────────────────────────────────────────────

/**
 * Credit availability ratio (0–1) for the availability progress bar.
 * Clamped to avoid invalid widths and division by zero.
 */
export const getCreditUsageRatio = (availableCredit: number, maxCredit: number): number => {
  if (maxCredit <= 0) return 0;
  return Math.min(Math.max(availableCredit / maxCredit, 0), 1);
};

/**
 * Repayment ratio (0–1) for the active-loan installment bar =
 * totalPaid / totalRepayment. Clamped to avoid invalid widths / divide-by-zero.
 */
export const getInstallmentProgress = (loan: LoanListItem | null): number => {
  if (!loan || loan.totalRepayment <= 0) return 0;
  return Math.min(Math.max(loan.totalPaid / loan.totalRepayment, 0), 1);
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UsePayScreenReturn {
  reputationScore: number;
  tier: ReputationTier | null;
  maxCredit: number;
  availableCredit: number;
  creditUsed: number;
  activeLoan: LoanListItem | null;
  nextPayment: LoanNextPayment | null;
  /** True when the score meets the minimum BNPL eligibility threshold. */
  isEligible: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook backing the Pay screen. Aggregates:
 *   - reputation score + tier + credit line  (GET /reputation/me)
 *   - borrowing-capacity breakdown            (GET /loans/available-credit)
 *   - the current active loan                 (GET /loans/my-loans?status=active)
 *
 * All calls require a JWT Bearer token (see lib/token-storage). When no API
 * base URL is configured the services return dev seeds shaped to the real DTOs.
 */
export const usePayScreen = (): UsePayScreenReturn => {
  const [reputationScore, setReputationScore] = useState(0);
  const [tier, setTier] = useState<ReputationTier | null>(null);
  const [maxCredit, setMaxCredit] = useState(0);
  const [availableCredit, setAvailableCredit] = useState(0);
  const [creditUsed, setCreditUsed] = useState(0);
  const [activeLoan, setActiveLoan] = useState<LoanListItem | null>(null);
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
        const [reputation, credit, loans] = await Promise.all([
          getMyReputation(signal),
          getAvailableCredit(signal),
          getMyLoans({ status: 'active', limit: 1, signal }),
        ]);
        if (!isMountedRef.current || signal.aborted) return;
        setReputationScore(reputation.score);
        setTier(reputation.tier);
        setMaxCredit(credit.maxCreditLimit);
        setAvailableCredit(credit.availableCredit);
        setCreditUsed(credit.creditUsed);
        setActiveLoan(loans.data[0] ?? null);
      } catch (err) {
        if (signal.aborted || !isMountedRef.current) return;
        const message =
          err instanceof ApiClientError ? err.message : 'Failed to load your Pay data';
        setError(message);
      } finally {
        if (isMountedRef.current && !signal.aborted) setIsLoading(false);
      }
    })();

    return () => {
      isMountedRef.current = false;
      controller.abort();
    };
  }, [reloadKey]);

  const nextPayment = activeLoan?.nextPayment ?? null;
  const isEligible = reputationScore >= MIN_ELIGIBLE_SCORE;

  return {
    reputationScore,
    tier,
    maxCredit,
    availableCredit,
    creditUsed,
    activeLoan,
    nextPayment,
    isEligible,
    isLoading,
    error,
    refresh,
  };
};
