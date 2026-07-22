/**
 * API types mirroring the TrustUp-API backend DTOs (source of truth).
 * See TrustUp-API `src/modules/{reputation,loans,merchants}/dto`.
 *
 * The backend wraps most responses in an envelope `{ success, data, message }`,
 * except `GET /merchants`, which returns its payload directly.
 */

/** Standard success envelope used by reputation and loans endpoints. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── Reputation ───────────────────────────────────────────────────────────────

/** Reputation tier as returned by the backend (NOT poor/fair/good/excellent). */
export type ReputationTier = 'gold' | 'silver' | 'bronze' | 'poor';

/** `GET /reputation/me` → data. */
export interface ReputationResponse {
  wallet: string;
  /** 0–100. */
  score: number;
  tier: ReputationTier;
  /** Annual interest rate % for the tier. */
  interestRate: number;
  /** Max credit limit in USD for the tier. */
  maxCredit: number;
  /** ISO-8601 timestamp of the last on-chain read. */
  lastUpdated: string;
}

/** `GET /loans/available-credit` → data. */
export interface AvailableCreditResponse {
  reputationScore: number;
  reputationTier: ReputationTier;
  maxCreditLimit: number;
  /** Outstanding balance across active loans, USD. */
  creditUsed: number;
  /** Remaining borrowing capacity, USD (never below zero). */
  availableCredit: number;
  activeLoans: number;
}

// ─── Loans ────────────────────────────────────────────────────────────────────

export type LoanListStatus = 'active' | 'completed' | 'defaulted';

export interface LoanListMerchant {
  id: string | null;
  name: string | null;
  logo: string | null;
}

export interface LoanNextPayment {
  dueDate: string | null;
  amount: number | null;
}

/** One item of `GET /loans/my-loans`. */
export interface LoanListItem {
  id: string;
  loanId: string;
  amount: number;
  loanAmount: number;
  guarantee: number;
  interestRate: number;
  totalRepayment: number;
  totalPaid: number;
  remainingBalance: number;
  term: number;
  status: LoanListStatus;
  merchant: LoanListMerchant;
  nextPayment: LoanNextPayment;
  createdAt: string;
  completedAt: string | null;
  defaultedAt: string | null;
}

export interface LoanListPagination {
  limit: number;
  offset: number;
  total: number;
}

/** `GET /loans/my-loans` → `{ success, data, pagination }`. */
export interface LoanListResponse {
  data: LoanListItem[];
  pagination: LoanListPagination;
}

/** Preview returned with a repayment's unsigned XDR. */
export interface LoanPaymentPreview {
  paymentAmount: number;
  currentBalance: number;
  newBalance: number;
  willComplete: boolean;
}

/** `POST /loans/:loanId/pay` → data. */
export interface LoanPaymentResponse {
  /** Unsigned XDR for the Soroban repay_loan() call, to be signed + submitted. */
  unsignedXdr: string;
  preview: LoanPaymentPreview;
}

// ─── Merchants ──────────────────────────────────────────────────────────────

/** One item of `GET /merchants` (no rating / credit fields on the backend). */
export interface MerchantSummary {
  id: string;
  wallet: string;
  name: string;
  logo: string;
  category: string;
  isActive: boolean;
}

/** `GET /merchants` → returned directly (no success envelope). */
export interface MerchantListResponse {
  merchants: MerchantSummary[];
  total: number;
  limit: number;
  offset: number;
}
