/**
 * Loan status values returned by the API.
 * - pending: Loan application submitted, awaiting approval
 * - active: Loan is approved and has outstanding payments
 * - completed: All installments have been paid
 * - defaulted: Borrower failed to meet repayment obligations
 */
export type LoanStatus = 'pending' | 'active' | 'completed' | 'defaulted';

/**
 * A single installment within a loan's repayment schedule.
 */
export interface LoanInstallment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'paid' | 'pending' | 'overdue';
}

/**
 * Full loan record as returned by the API.
 */
export interface Loan {
  id: string;
  merchantName: string;
  merchantId: string;
  amount: number;
  amountPaid: number;
  interestRate: number;
  totalWithInterest: number;
  status: LoanStatus;
  installmentCount: number;
  installments: LoanInstallment[];
  nextPaymentDue: string | null;
  nextPaymentAmount: number | null;
  createdAt: string;
  completedAt: string | null;
}

/**
 * Paginated response shape from GET /loans/my-loans.
 */
export interface LoansResponse {
  loans: Loan[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}
