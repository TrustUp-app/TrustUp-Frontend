import {
  filterLoansByStatus,
  getRepaymentProgress,
  formatLoanAmount,
  getDueDateLabel,
  hasOverdueInstallments,
  mapLoanListItemToLoan,
} from './use-loans';
import type { Loan } from '../../types/Loan';
import type { LoanListItem } from '../../types/api';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const makeLoan = (overrides: Partial<Loan>): Loan => ({
  id: 'test-loan',
  merchantName: 'TestMerchant',
  merchantId: 'merchant-test',
  amount: 100,
  amountPaid: 50,
  interestRate: 3,
  totalWithInterest: 103,
  status: 'active',
  installmentCount: 2,
  installments: [],
  nextPaymentDue: '2026-07-01',
  nextPaymentAmount: 51.5,
  createdAt: '2026-06-01T00:00:00Z',
  completedAt: null,
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useLoans utility functions', () => {
  describe('mapLoanListItemToLoan', () => {
    it('maps backend LoanListItem DTO correctly to frontend Loan model', () => {
      const dto: LoanListItem = {
        id: 'dto-id-1',
        loanId: 'chain-1',
        amount: 500,
        loanAmount: 400,
        guarantee: 100,
        interestRate: 8,
        totalRepayment: 410.67,
        totalPaid: 205.34,
        remainingBalance: 205.33,
        term: 4,
        status: 'active',
        merchant: { id: 'm-1', name: 'TechStore', logo: null },
        nextPayment: { dueDate: '2026-07-20T00:00:00.000Z', amount: 102.66 },
        createdAt: '2026-03-29T12:00:00.000Z',
        completedAt: null,
        defaultedAt: null,
      };

      const loan = mapLoanListItemToLoan(dto);
      expect(loan.id).toBe('dto-id-1');
      expect(loan.merchantName).toBe('TechStore');
      expect(loan.merchantId).toBe('m-1');
      expect(loan.amount).toBe(500);
      expect(loan.amountPaid).toBe(205.34);
      expect(loan.interestRate).toBe(8);
      expect(loan.totalWithInterest).toBe(410.67);
      expect(loan.status).toBe('active');
      expect(loan.installmentCount).toBe(4);
      expect(loan.installments).toEqual([]);
      expect(loan.nextPaymentDue).toBe('2026-07-20T00:00:00.000Z');
      expect(loan.nextPaymentAmount).toBe(102.66);
      expect(loan.createdAt).toBe('2026-03-29T12:00:00.000Z');
      expect(loan.completedAt).toBeNull();
    });

    it('handles missing merchant or nextPayment safely', () => {
      const dto: LoanListItem = {
        id: 'dto-id-2',
        loanId: 'chain-2',
        amount: 300,
        loanAmount: 300,
        guarantee: 0,
        interestRate: 5,
        totalRepayment: 315,
        totalPaid: 315,
        remainingBalance: 0,
        term: 2,
        status: 'completed',
        merchant: { id: null, name: null, logo: null },
        nextPayment: { dueDate: null, amount: null },
        createdAt: '2026-01-01T00:00:00.000Z',
        completedAt: '2026-02-01T00:00:00.000Z',
        defaultedAt: null,
      };

      const loan = mapLoanListItemToLoan(dto);
      expect(loan.merchantName).toBe('Unknown Merchant');
      expect(loan.nextPaymentDue).toBeNull();
      expect(loan.nextPaymentAmount).toBeNull();
      expect(loan.completedAt).toBe('2026-02-01T00:00:00.000Z');
    });
  });

  describe('filterLoansByStatus', () => {
    const loans: Loan[] = [
      makeLoan({ id: '1', status: 'active' }),
      makeLoan({ id: '2', status: 'completed' }),
      makeLoan({ id: '3', status: 'active' }),
      makeLoan({ id: '4', status: 'defaulted' }),
    ];

    it('returns only loans matching the given status', () => {
      const active = filterLoansByStatus(loans, 'active');
      expect(active).toHaveLength(2);
      expect(active.every((l: Loan) => l.status === 'active')).toBe(true);
    });

    it('returns an empty array when no loans match', () => {
      expect(filterLoansByStatus(loans, 'pending')).toHaveLength(0);
    });

    it('handles an empty input array', () => {
      expect(filterLoansByStatus([], 'active')).toHaveLength(0);
    });
  });

  describe('getRepaymentProgress', () => {
    it('returns 0 when nothing has been paid', () => {
      const loan = makeLoan({ amountPaid: 0, totalWithInterest: 100 });
      expect(getRepaymentProgress(loan)).toBe(0);
    });

    it('returns 1 when fully paid', () => {
      const loan = makeLoan({ amountPaid: 100, totalWithInterest: 100 });
      expect(getRepaymentProgress(loan)).toBe(1);
    });

    it('returns correct ratio for partial payment', () => {
      const loan = makeLoan({ amountPaid: 25, totalWithInterest: 100 });
      expect(getRepaymentProgress(loan)).toBeCloseTo(0.25);
    });

    it('clamps to 0 when totalWithInterest is 0', () => {
      const loan = makeLoan({ amountPaid: 50, totalWithInterest: 0 });
      expect(getRepaymentProgress(loan)).toBe(0);
    });

    it('clamps to 1 when overpaid', () => {
      const loan = makeLoan({ amountPaid: 200, totalWithInterest: 100 });
      expect(getRepaymentProgress(loan)).toBe(1);
    });
  });

  describe('formatLoanAmount', () => {
    it('formats whole numbers with 2 decimal places', () => {
      expect(formatLoanAmount(100)).toBe('$100.00');
    });

    it('formats fractional amounts correctly', () => {
      expect(formatLoanAmount(51.75)).toBe('$51.75');
    });

    it('uses absolute value for negative inputs', () => {
      expect(formatLoanAmount(-25.5)).toBe('$25.50');
    });

    it('returns "$0.00" for NaN', () => {
      expect(formatLoanAmount(NaN)).toBe('$0.00');
    });

    it('returns "$0.00" for Infinity', () => {
      expect(formatLoanAmount(Infinity)).toBe('$0.00');
    });
  });

  describe('getDueDateLabel', () => {
    it('returns "Due today" for today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(getDueDateLabel(today)).toBe('Due today');
    });

    it('returns "1 day left" for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(getDueDateLabel(tomorrow.toISOString().split('T')[0])).toBe('1 day left');
    });

    it('returns "X days left" for future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      expect(getDueDateLabel(future.toISOString().split('T')[0])).toBe('5 days left');
    });

    it('returns "1 day overdue" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(getDueDateLabel(yesterday.toISOString().split('T')[0])).toBe('1 day overdue');
    });
  });

  describe('hasOverdueInstallments', () => {
    it('returns true when at least one installment is overdue', () => {
      const loan = makeLoan({
        installments: [
          {
            id: '1',
            installmentNumber: 1,
            amount: 50,
            dueDate: '2026-01-01',
            paidDate: '2026-01-01',
            status: 'paid',
          },
          {
            id: '2',
            installmentNumber: 2,
            amount: 50,
            dueDate: '2026-02-01',
            paidDate: null,
            status: 'overdue',
          },
        ],
      });
      expect(hasOverdueInstallments(loan)).toBe(true);
    });

    it('returns false when no installments are overdue', () => {
      const loan = makeLoan({
        installments: [
          {
            id: '1',
            installmentNumber: 1,
            amount: 50,
            dueDate: '2026-01-01',
            paidDate: '2026-01-01',
            status: 'paid',
          },
          {
            id: '2',
            installmentNumber: 2,
            amount: 50,
            dueDate: '2026-02-01',
            paidDate: null,
            status: 'pending',
          },
        ],
      });
      expect(hasOverdueInstallments(loan)).toBe(false);
    });

    it('returns false for an empty installments array when active and not past due', () => {
      const loan = makeLoan({ installments: [], status: 'active', nextPaymentDue: '2099-01-01' });
      expect(hasOverdueInstallments(loan)).toBe(false);
    });

    it('returns true for an empty installments array when defaulted', () => {
      const loan = makeLoan({ installments: [], status: 'defaulted' });
      expect(hasOverdueInstallments(loan)).toBe(true);
    });
  });
});
