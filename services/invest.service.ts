import { apiClient } from '../lib/api';

export interface DepositRequest {
  amount: number;
  currency?: string;
}

export interface DepositResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  transactionHash?: string;
  message?: string;
}

export const investService = {
  /**
   * Initiates a deposit via the TrustUp-API.
   * @param data - The deposit payload including amount and optional currency.
   * @returns Promise resolving to the deposit response.
   * @throws Error if the API call fails or returns a non-2xx status.
   */
  deposit: async (data: DepositRequest): Promise<DepositResponse> => {
    const response = await apiClient.post<DepositResponse>('/invest/deposit', data);
    return response.data;
  },
};