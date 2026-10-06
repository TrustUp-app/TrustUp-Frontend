import { apiClient } from '../lib/api';

/**
 * Request body for `POST /liquidity/deposit`.
 * Amount is in USD; the API enforces a $10 minimum (see
 * `TrustUp-app/TrustUp-API` → `src/modules/liquidity/dto/liquidity-deposit-request.dto.ts`).
 */
export interface DepositRequest {
  amount: number;
}

/**
 * Deposit preview returned alongside the unsigned transaction.
 * Mirrors `LiquidityDepositPreviewDto` in TrustUp-API.
 */
export interface DepositPreview {
  depositAmount: number;
  sharesReceived: number;
  currentSharePrice: number;
  newTotalValue: number;
  currentTotalLiquidity: number;
}

/**
 * Response for `POST /liquidity/deposit` (the `data` payload of the API
 * envelope). Mirrors `LiquidityDepositResponseDto` in TrustUp-API.
 */
export interface DepositResponse {
  unsignedXdr: string;
  description: string;
  preview: DepositPreview;
}

export const investService = {
  /**
   * Builds the (unsigned) liquidity-pool deposit transaction.
   *
   * `POST /liquidity/deposit` — authenticated (JWT); `apiClient` attaches the
   * bearer token and unwraps the `{ success, data, message }` envelope, so the
   * resolved value is the deposit payload itself.
   *
   * @param data - The deposit payload (amount in USD, minimum $10).
   * @returns The unsigned XDR transaction plus its preview.
   * @throws ApiError when the API rejects the request (e.g. below minimum).
   */
  deposit: (data: DepositRequest): Promise<DepositResponse> =>
    apiClient.post<DepositResponse>('/liquidity/deposit', data),
};
