import { useState, useCallback } from 'react';
import type { Loan, LoanStatus } from '../../types/Loan';
import type { LoanListItem } from '../../types/api';
import { getMyLoans } from '../../services/loans.service';

// ─── Utilities & Mappers ──────────────────────────────────────────────────────

/**
 * Maps a backend `LoanListItem` DTO to the frontend `Loan` UI model.
 */
export const mapLoanListItemToLoan = (item: LoanListItem): Loan => {
  return {
    id: item.id || item.loanId,
    merchantName: item.merchant?.name || 'Unknown Merchant',
    merchantId: item.merchant?.id || '',
    amount: item.amount ?? item.loanAmount ?? 0,
    amountPaid: item.totalPaid ?? 0,
    interestRate: item.interestRate ?? 0,
    totalWithInterest: item.totalRepayment ?? item.amount ?? item.loanAmount ?? 0,
    status: item.status,
    installmentCount: item.term ?? 0,
    installments: [],
    nextPaymentDue: item.nextPayment?.dueDate ?? null,
    nextPaymentAmount: item.nextPayment?.amount ?? null,
    createdAt: item.createdAt,
    completedAt: item.completedAt ?? null,
  };
};

/**
 * Filters a list of loans by their status.
 */
export const filterLoansByStatus = (loans: Loan[], status: LoanStatus): Loan[] => {
  return loans.filter((loan) => loan.status === status);
};

/**
 * Calculates the repayment progress as a value between 0 and 1.
 */
export const getRepaymentProgress = (loan: Loan): number => {
  if (loan.totalWithInterest <= 0) return 0;
  const progress = loan.amountPaid / loan.totalWithInterest;
  return Math.min(Math.max(progress, 0), 1);
};

/**
 * Formats a dollar amount to a display string with 2 decimal places.
 */
export const formatLoanAmount = (amount: number): string => {
  if (!isFinite(amount) || isNaN(amount)) return '$0.00';
  return `$${Math.abs(amount).toFixed(2)}`;
};

/**
 * Returns a human-readable relative date string for a due date.
 * e.g. "3 days left", "Due today", "5 days overdue"
 */
export const getDueDateLabel = (dueDateStr: string): string => {
  const now = new Date();
  const dueDate = new Date(dueDateStr);

  // Strip time component for day-level comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const diffMs = dueStart.getTime() - todayStart.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return '1 day left';
  if (diffDays > 1) return `${diffDays} days left`;
  if (diffDays === -1) return '1 day overdue';
  return `${Math.abs(diffDays)} days overdue`;
};

/**
 * Checks whether any installment in a loan is overdue.
 */
export const hasOverdueInstallments = (loan: Loan): boolean => {
  if (!loan.installments || loan.installments.length === 0) {
    if (loan.status === 'defaulted') return true;
    if (loan.nextPaymentDue && loan.status === 'active') {
      const now = new Date();
      const dueDate = new Date(loan.nextPaymentDue);
      return dueDate.getTime() < now.getTime();
    }
    return false;
  }
  return loan.installments.some((inst) => inst.status === 'overdue');
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Return type for the useLoans hook.
 */
export interface UseLoansReturn {
  loans: Loan[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  activeFilter: LoanStatus;
  setActiveFilter: (status: LoanStatus) => void;
  loadMore: () => void;
  refresh: () => void;
}

const PAGE_SIZE = 20;

/**
 * Custom hook for fetching and managing the user's loan list via getMyLoans.
 * Supports status filtering and pagination.
 */
export const useLoans = (): UseLoansReturn => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [activeFilter, setActiveFilterState] = useState<LoanStatus>('active');
  const [offset, setOffset] = useState(0);

  /**
   * Fetches loans from getMyLoans service.
   */
  const fetchLoans = useCallback(
    async (status: LoanStatus, pageOffset: number, append: boolean) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyLoans({
          status: status === 'pending' ? undefined : status,
          limit: PAGE_SIZE,
          offset: pageOffset,
        });

        const mappedLoans = (response.data || []).map(mapLoanListItemToLoan);
        // If the backend returns all loans or unfiltered status when 'pending' was passed, filter locally
        const filteredLoans =
          status === 'pending' ? mappedLoans.filter((l) => l.status === 'pending') : mappedLoans;

        if (append) {
          setLoans((prev) => [...prev, ...filteredLoans]);
        } else {
          setLoans(filteredLoans);
        }

        const total = response.pagination?.total ?? filteredLoans.length;
        const currentCount = pageOffset + filteredLoans.length;
        setHasMore(currentCount < total);
        setOffset(pageOffset + filteredLoans.length);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load loans';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Change the active status filter and re-fetch from the beginning
  const setActiveFilter = useCallback(
    (status: LoanStatus) => {
      setActiveFilterState(status);
      setOffset(0);
      fetchLoans(status, 0, false);
    },
    [fetchLoans]
  );

  // Append the next page of results
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchLoans(activeFilter, offset, true);
  }, [isLoading, hasMore, activeFilter, offset, fetchLoans]);

  // Reset and re-fetch from page 0
  const refresh = useCallback(() => {
    setOffset(0);
    fetchLoans(activeFilter, 0, false);
  }, [activeFilter, fetchLoans]);

  return {
    loans,
    isLoading,
    error,
    hasMore,
    activeFilter,
    setActiveFilter,
    loadMore,
    refresh,
  };
};
