import { apiClient } from '../lib/api-client';

export interface PaymentScheduleItem {
  paymentNumber: number;
  amount: number;
  dueDate: string;
}

export interface LoanQuote {
  amount: number;
  guarantee: number;
  loanAmount: number;
  interestRate: number;
  totalRepayment: number;
  term: number;
  schedule: PaymentScheduleItem[];
}

export interface LoanXdrResponse {
  loanId: string;
  xdr: string;
  description: string;
}

export interface RepayXdrResponse {
  xdr: string;
  remainingBalance: number;
  nextPaymentDue: string;
  description: string;
}

export interface Loan {
  id: string;
  merchant: { id: string; name: string; wallet?: string };
  amount: number;
  loanAmount: number;
  guarantee: number;
  interestRate?: number;
  totalRepayment: number;
  remainingBalance: number;
  status: 'active' | 'completed' | 'defaulted';
  nextPaymentDue?: string;
  payments?: Array<{ amount: number; timestamp: string; txHash: string }>;
  schedule?: PaymentScheduleItem[];
  createdAt: string;
}

export interface LoanListResponse {
  loans: Loan[];
  total: number;
  limit: number;
  offset: number;
}

export interface ReputationResponse {
  wallet: string;
  score: number;
  tier: string;
  interestRate: number;
  maxCredit: number;
  lastUpdated?: string;
  history?: Array<{ timestamp: string; oldScore: number; newScore: number; reason: string }>;
}

export const loansService = {
  getQuote: (amount: number, merchant: string, term: number) =>
    apiClient.post<LoanQuote>('/loans/quote', { amount, merchant, term }).then((r) => r.data),

  create: (amount: number, merchant: string, guarantee: number, term: number) =>
    apiClient
      .post<LoanXdrResponse>('/loans/create', { amount, merchant, guarantee, term })
      .then((r) => r.data),

  repay: (loanId: string, amount: number) =>
    apiClient.post<RepayXdrResponse>(`/loans/${loanId}/repay`, { amount }).then((r) => r.data),

  getMyLoans: (params?: { status?: string; limit?: number; offset?: number }) =>
    apiClient.get<LoanListResponse>('/loans/me', { params }).then((r) => r.data),

  getLoan: (loanId: string) =>
    apiClient.get<Loan>(`/loans/${loanId}`).then((r) => r.data),

  getMyReputation: () =>
    apiClient.get<ReputationResponse>('/reputation/me').then((r) => r.data),

  getReputation: (wallet: string) =>
    apiClient.get<ReputationResponse>(`/reputation/${wallet}`).then((r) => r.data),
};
