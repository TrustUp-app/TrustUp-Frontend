import { apiClient, isApiConfigured } from '../lib/api-client';
import type {
  ApiEnvelope,
  AvailableCreditResponse,
  LoanListItem,
  LoanListResponse,
  LoanListStatus,
  LoanPaymentResponse,
} from '../types/api';

// ─── Dev seeds (used only when no API base URL is configured) ────────────────
// Shaped to the real backend DTOs so the UI can be reviewed without a backend.
// MUST NOT be relied on in production.

const DEV_AVAILABLE_CREDIT: AvailableCreditResponse = {
  reputationScore: 75,
  reputationTier: 'silver',
  maxCreditLimit: 3000,
  creditUsed: 825.5,
  availableCredit: 2174.5,
  activeLoans: 1,
};

const DEV_ACTIVE_LOAN: LoanListItem = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  loanId: 'chain-loan-1',
  amount: 500,
  loanAmount: 400,
  guarantee: 100,
  interestRate: 8,
  totalRepayment: 410.67,
  totalPaid: 205.34,
  remainingBalance: 205.33,
  term: 4,
  status: 'active',
  merchant: { id: 'merchant-1', name: 'TechStore', logo: null },
  nextPayment: { dueDate: '2026-07-20T00:00:00.000Z', amount: 102.66 },
  createdAt: '2026-03-29T12:00:00.000Z',
  completedAt: null,
  defaultedAt: null,
};

export interface GetMyLoansParams {
  status?: LoanListStatus;
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

/**
 * `GET /loans/my-loans` — paginated loans for the authenticated user (JWT).
 */
export async function getMyLoans({
  status,
  limit = 20,
  offset = 0,
  signal,
}: GetMyLoansParams = {}): Promise<LoanListResponse> {
  if (!isApiConfigured) {
    const all = [DEV_ACTIVE_LOAN];
    const data = status ? all.filter((l) => l.status === status) : all;
    return { data, pagination: { limit, offset, total: data.length } };
  }
  // Backend shape: { success, data: LoanListItem[], pagination }
  const res = await apiClient.get<
    ApiEnvelope<LoanListItem[]> & { pagination: LoanListResponse['pagination'] }
  >('/loans/my-loans', { params: { status, limit, offset }, signal });
  return { data: res.data, pagination: res.pagination };
}

/**
 * `GET /loans/available-credit` — borrowing-capacity breakdown (JWT).
 */
export async function getAvailableCredit(signal?: AbortSignal): Promise<AvailableCreditResponse> {
  if (!isApiConfigured) return DEV_AVAILABLE_CREDIT;
  const res = await apiClient.get<ApiEnvelope<AvailableCreditResponse>>('/loans/available-credit', {
    signal,
  });
  return res.data;
}

/**
 * `POST /loans/:loanId/pay` — build the unsigned repayment XDR + preview (JWT).
 * The app must then sign the XDR and submit it via the transactions endpoint.
 */
export async function repayLoan(
  loanId: string,
  amount: number,
  signal?: AbortSignal
): Promise<LoanPaymentResponse> {
  if (!isApiConfigured) {
    return {
      unsignedXdr: 'DEV_UNSIGNED_XDR',
      preview: { paymentAmount: amount, currentBalance: 0, newBalance: 0, willComplete: false },
    };
  }
  const res = await apiClient.post<ApiEnvelope<LoanPaymentResponse>>(
    `/loans/${loanId}/pay`,
    { amount },
    { signal }
  );
  return res.data;
}
