import { useState, useCallback } from 'react';
import type { Loan, LoanStatus } from '../../types/Loan';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LOANS: Loan[] = [
  {
    id: 'loan-001',
    merchantName: 'TechStore',
    merchantId: 'merchant-001',
    amount: 150.0,
    amountPaid: 50.0,
    interestRate: 3.5,
    totalWithInterest: 155.25,
    status: 'active',
    installmentCount: 3,
    installments: [
      {
        id: 'inst-001',
        installmentNumber: 1,
        amount: 51.75,
        dueDate: '2026-06-01',
        paidDate: '2026-05-30',
        status: 'paid',
      },
      {
        id: 'inst-002',
        installmentNumber: 2,
        amount: 51.75,
        dueDate: '2026-07-01',
        paidDate: null,
        status: 'pending',
      },
      {
        id: 'inst-003',
        installmentNumber: 3,
        amount: 51.75,
        dueDate: '2026-08-01',
        paidDate: null,
        status: 'pending',
      },
    ],
    nextPaymentDue: '2026-07-01',
    nextPaymentAmount: 51.75,
    createdAt: '2026-05-15T10:30:00Z',
    completedAt: null,
  },
  {
    id: 'loan-002',
    merchantName: 'FashionHub',
    merchantId: 'merchant-002',
    amount: 280.0,
    amountPaid: 96.6,
    interestRate: 4.0,
    totalWithInterest: 291.2,
    status: 'active',
    installmentCount: 4,
    installments: [
      {
        id: 'inst-004',
        installmentNumber: 1,
        amount: 72.8,
        dueDate: '2026-05-15',
        paidDate: '2026-05-14',
        status: 'paid',
      },
      {
        id: 'inst-005',
        installmentNumber: 2,
        amount: 72.8,
        dueDate: '2026-06-15',
        paidDate: '2026-06-13',
        status: 'paid',
      },
      {
        id: 'inst-006',
        installmentNumber: 3,
        amount: 72.8,
        dueDate: '2026-06-24',
        paidDate: null,
        status: 'overdue',
      },
      {
        id: 'inst-007',
        installmentNumber: 4,
        amount: 72.8,
        dueDate: '2026-08-15',
        paidDate: null,
        status: 'pending',
      },
    ],
    nextPaymentDue: '2026-06-24',
    nextPaymentAmount: 72.8,
    createdAt: '2026-04-20T08:00:00Z',
    completedAt: null,
  },
  {
    id: 'loan-003',
    merchantName: 'ElectroMart',
    merchantId: 'merchant-003',
    amount: 500.0,
    amountPaid: 500.0,
    interestRate: 2.5,
    totalWithInterest: 512.5,
    status: 'completed',
    installmentCount: 5,
    installments: [
      {
        id: 'inst-008',
        installmentNumber: 1,
        amount: 102.5,
        dueDate: '2026-01-15',
        paidDate: '2026-01-14',
        status: 'paid',
      },
      {
        id: 'inst-009',
        installmentNumber: 2,
        amount: 102.5,
        dueDate: '2026-02-15',
        paidDate: '2026-02-15',
        status: 'paid',
      },
      {
        id: 'inst-010',
        installmentNumber: 3,
        amount: 102.5,
        dueDate: '2026-03-15',
        paidDate: '2026-03-12',
        status: 'paid',
      },
      {
        id: 'inst-011',
        installmentNumber: 4,
        amount: 102.5,
        dueDate: '2026-04-15',
        paidDate: '2026-04-14',
        status: 'paid',
      },
      {
        id: 'inst-012',
        installmentNumber: 5,
        amount: 102.5,
        dueDate: '2026-05-15',
        paidDate: '2026-05-10',
        status: 'paid',
      },
    ],
    nextPaymentDue: null,
    nextPaymentAmount: null,
    createdAt: '2025-12-20T14:00:00Z',
    completedAt: '2026-05-10T09:30:00Z',
  },
  {
    id: 'loan-004',
    merchantName: 'HomeGoods',
    merchantId: 'merchant-004',
    amount: 200.0,
    amountPaid: 68.0,
    interestRate: 5.0,
    totalWithInterest: 210.0,
    status: 'defaulted',
    installmentCount: 3,
    installments: [
      {
        id: 'inst-013',
        installmentNumber: 1,
        amount: 70.0,
        dueDate: '2026-02-01',
        paidDate: '2026-02-01',
        status: 'paid',
      },
      {
        id: 'inst-014',
        installmentNumber: 2,
        amount: 70.0,
        dueDate: '2026-03-01',
        paidDate: null,
        status: 'overdue',
      },
      {
        id: 'inst-015',
        installmentNumber: 3,
        amount: 70.0,
        dueDate: '2026-04-01',
        paidDate: null,
        status: 'overdue',
      },
    ],
    nextPaymentDue: null,
    nextPaymentAmount: null,
    createdAt: '2026-01-10T12:00:00Z',
    completedAt: null,
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

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
 * Custom hook for fetching and managing the user's loan list.
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
   * Fetches loans from the API.
   *
   * @todo Replace this placeholder implementation with a real network call:
   *   GET /loans/my-loans?status={status}&limit={limit}&offset={offset}
   *
   * Until the endpoint is available this function returns hardcoded mock data
   * so that the UI can be developed and reviewed. It MUST NOT ship to
   * production in this state.
   */
  const fetchLoans = useCallback(
    (status: LoanStatus, pageOffset: number, append: boolean) => {
      setIsLoading(true);
      setError(null);

      // TODO: replace with `fetch('/loans/my-loans?...')` once the API is ready.
      setTimeout(() => {
        try {
          const filtered = filterLoansByStatus(MOCK_LOANS, status);
          const page = filtered.slice(pageOffset, pageOffset + PAGE_SIZE);

          if (append) {
            setLoans((prev) => [...prev, ...page]);
          } else {
            setLoans(page);
          }

          setHasMore(pageOffset + PAGE_SIZE < filtered.length);
          setOffset(pageOffset + PAGE_SIZE);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load loans';
          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, 600);
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
