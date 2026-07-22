import { apiClient, isApiConfigured } from '../lib/api-client';
import type { ApiEnvelope, ReputationResponse } from '../types/api';

/**
 * Dev seed used ONLY when no API base URL is configured, so the UI can be
 * developed/reviewed without a running backend + JWT. Shaped to the real
 * backend DTO. MUST NOT be relied on in production.
 */
const DEV_SEED: ReputationResponse = {
  wallet: 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H',
  score: 75,
  tier: 'silver',
  interestRate: 8,
  maxCredit: 3000,
  lastUpdated: '2026-07-01T09:00:00.000Z',
};

/**
 * `GET /reputation/me` — reputation for the authenticated user (JWT Bearer).
 */
export async function getMyReputation(signal?: AbortSignal): Promise<ReputationResponse> {
  if (!isApiConfigured) return DEV_SEED;
  const res = await apiClient.get<ApiEnvelope<ReputationResponse>>('/reputation/me', { signal });
  return res.data;
}
