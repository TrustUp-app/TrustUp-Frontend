import { apiClient, ApiClientError, isApiConfigured } from '../lib/api-client';
import type { MerchantDetail, MerchantListResponse, MerchantSummary } from '../types/api';

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

/** Dev seed for `getMerchantById`, keyed by the `DEV_MERCHANTS` ids above. */
const DEV_MERCHANT_DETAILS: Record<string, MerchantDetail> = {
  'merchant-1': {
    id: 'merchant-1',
    wallet: 'GMER...ABC',
    name: 'TechStore',
    logo: '',
    description: 'Electronics retailer accepting BNPL purchases through TrustUp.',
    category: 'Electronics',
    website: 'https://techstore.example.com',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  'merchant-2': {
    id: 'merchant-2',
    wallet: 'GMER...DEF',
    name: 'FashionHub',
    logo: '',
    description: 'Clothing and accessories retailer accepting BNPL purchases through TrustUp.',
    category: 'Fashion',
    website: 'https://fashionhub.example.com',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  'merchant-3': {
    id: 'merchant-3',
    wallet: 'GMER...GHI',
    name: 'HomeGoods',
    logo: '',
    description: 'Home and living goods retailer accepting BNPL purchases through TrustUp.',
    category: 'Home & Living',
    website: 'https://homegoods.example.com',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
};

/**
 * `GET /merchants/:id` — merchant details (JWT). Note the backend returns the
 * payload directly (no `{ success, data }` envelope).
 */
export async function getMerchantById(id: string, signal?: AbortSignal): Promise<MerchantDetail> {
  if (!isApiConfigured) {
    const merchant = DEV_MERCHANT_DETAILS[id];
    if (!merchant) throw new ApiClientError('Merchant not found', 404);
    return merchant;
  }
  return apiClient.get<MerchantDetail>(`/merchants/${id}`, { signal });
}
