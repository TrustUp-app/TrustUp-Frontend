import { apiClient, isApiConfigured } from '../lib/api-client';
import type { MerchantListResponse, MerchantSummary } from '../types/api';

/**
 * Dev seed used ONLY when no API base URL is configured. Shaped to the real
 * backend DTO (`MerchantSummaryDto` — no rating/credit fields exist on the
 * backend). MUST NOT be relied on in production.
 */
const DEV_MERCHANTS: MerchantSummary[] = [
  {
    id: 'merchant-1',
    wallet: 'GMER...ABC',
    name: 'TechStore',
    logo: '',
    category: 'Electronics',
    isActive: true,
  },
  {
    id: 'merchant-2',
    wallet: 'GMER...DEF',
    name: 'FashionHub',
    logo: '',
    category: 'Fashion',
    isActive: true,
  },
  {
    id: 'merchant-3',
    wallet: 'GMER...GHI',
    name: 'HomeGoods',
    logo: '',
    category: 'Home & Living',
    isActive: true,
  },
];

export interface ListMerchantsParams {
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

/**
 * `GET /merchants` — active merchants (JWT). Note the backend returns the
 * payload directly (no `{ success, data }` envelope).
 */
export async function listMerchants({
  limit = 20,
  offset = 0,
  signal,
}: ListMerchantsParams = {}): Promise<MerchantListResponse> {
  if (!isApiConfigured) {
    return { merchants: DEV_MERCHANTS, total: DEV_MERCHANTS.length, limit, offset };
  }
  return apiClient.get<MerchantListResponse>('/merchants', { params: { limit, offset }, signal });
}
