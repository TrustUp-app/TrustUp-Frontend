import { apiClient } from '../lib/api-client';

export interface TransactionSubmitResponse {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  submittedAt: string;
}

export interface TransactionStatusResponse {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  result?: { ledger: number; timestamp: string };
  submittedAt: string;
}

export const transactionsService = {
  submit: (xdr: string) =>
    apiClient.post<TransactionSubmitResponse>('/transactions/submit', { xdr }).then((r) => r.data),

  getStatus: (hash: string) =>
    apiClient.get<TransactionStatusResponse>(`/transactions/${hash}`).then((r) => r.data),
};
