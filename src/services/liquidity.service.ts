import { apiClient } from '../lib/api-client';

export interface LiquidityOverview {
  totalLiquidity: number;
  availableLiquidity: number;
  loanedAmount: number;
  utilization: number;
  apy: number;
  totalProviders: number;
}

export interface LiquidityPosition {
  wallet: string;
  shares: number;
  shareValue: number;
  currentValue: number;
  depositedAmount: number;
  gains: number;
  apy: number;
  depositedAt: string;
}

export interface LiquidityXdrResponse {
  xdr: string;
  description: string;
}

export interface DepositXdrResponse extends LiquidityXdrResponse {
  amount: number;
  expectedShares: number;
  currentShareValue: number;
}

export interface WithdrawXdrResponse extends LiquidityXdrResponse {
  shares: number;
  expectedAmount: number;
  currentShareValue: number;
}

export const liquidityService = {
  getOverview: () =>
    apiClient.get<LiquidityOverview>('/liquidity/overview').then((r) => r.data),

  getMyPosition: () =>
    apiClient.get<LiquidityPosition>('/liquidity/position').then((r) => r.data),

  deposit: (amount: number) =>
    apiClient.post<DepositXdrResponse>('/liquidity/deposit', { amount }).then((r) => r.data),

  withdraw: (shares: number) =>
    apiClient.post<WithdrawXdrResponse>('/liquidity/withdraw', { shares }).then((r) => r.data),
};
