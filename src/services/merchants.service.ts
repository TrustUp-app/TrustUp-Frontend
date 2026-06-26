import { apiClient } from '../lib/api-client';

export interface Merchant {
  id: string;
  wallet: string;
  name: string;
  logo: string;
  category: string;
  isActive: boolean;
  description?: string;
  website?: string;
  createdAt?: string;
}

export interface MerchantListResponse {
  merchants: Merchant[];
  total: number;
  limit: number;
  offset: number;
}

export const merchantsService = {
  list: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<MerchantListResponse>('/merchants', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Merchant>(`/merchants/${id}`).then((r) => r.data),
};
