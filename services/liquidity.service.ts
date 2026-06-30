import { apiClient } from '../lib/api-client';
import {
  ApiResponse,
  LiquidityPool,
  Investment,
  InvestRequest,
  PaginatedResponse,
  PaginationParams,
} from '../types/api';

/**
 * Liquidity Service
 * Handles all liquidity pool and investment-related API calls
 */

/**
 * Get current liquidity pool information
 * @returns Liquidity pool details
 */
export const getLiquidityPool = async (): Promise<ApiResponse<LiquidityPool>> => {
  const response = await apiClient.get<ApiResponse<LiquidityPool>>('/liquidity/pool');
  return response.data;
};

/**
 * Deposit funds into the liquidity pool
 * @param investData - Investment amount
 * @returns Created investment record
 */
export const depositToPool = async (
  investData: InvestRequest
): Promise<ApiResponse<Investment>> => {
  const response = await apiClient.post<ApiResponse<Investment>>('/liquidity/deposit', investData);
  return response.data;
};

/**
 * Withdraw funds from the liquidity pool
 * @param amount - Amount to withdraw
 * @returns Withdrawal transaction details
 */
export const withdrawFromPool = async (
  amount: number
): Promise<ApiResponse<{ transaction: string; amount: number }>> => {
  const response = await apiClient.post<ApiResponse<{ transaction: string; amount: number }>>(
    '/liquidity/withdraw',
    { amount }
  );
  return response.data;
};

/**
 * Get user's investment history
 * @param params - Pagination parameters
 * @returns Paginated list of investments
 */
export const getMyInvestments = async (
  params?: PaginationParams
): Promise<ApiResponse<PaginatedResponse<Investment>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Investment>>>(
    '/liquidity/investments',
    { params }
  );
  return response.data;
};

/**
 * Get a specific investment by ID
 * @param investmentId - Investment identifier
 * @returns Investment details
 */
export const getInvestmentById = async (investmentId: string): Promise<ApiResponse<Investment>> => {
  const response = await apiClient.get<ApiResponse<Investment>>(
    `/liquidity/investments/${investmentId}`
  );
  return response.data;
};

/**
 * Calculate potential earnings for an investment
 * @param amount - Investment amount
 * @param duration - Duration in days
 * @returns Estimated earnings
 */
export const calculateEarnings = async (
  amount: number,
  duration: number
): Promise<ApiResponse<{ estimatedEarnings: number; apy: number }>> => {
  const response = await apiClient.get<ApiResponse<{ estimatedEarnings: number; apy: number }>>(
    '/liquidity/calculate-earnings',
    {
      params: { amount, duration },
    }
  );
  return response.data;
};

/**
 * Get investment statistics for the current user
 * @returns User's investment statistics
 */
export const getInvestmentStats = async (): Promise<
  ApiResponse<{
    totalInvested: number;
    activeInvestments: number;
    totalEarnings: number;
    currentBalance: number;
  }>
> => {
  const response = await apiClient.get<
    ApiResponse<{
      totalInvested: number;
      activeInvestments: number;
      totalEarnings: number;
      currentBalance: number;
    }>
  >('/liquidity/stats');
  return response.data;
};

/**
 * Historical liquidity data point
 */
export interface HistoricalLiquidityData {
  date: string;
  liquidity: number;
  apy: number;
}

/**
 * Get liquidity pool analytics
 * @returns Pool analytics data
 */
export const getPoolAnalytics = async (): Promise<
  ApiResponse<{
    totalVolume: number;
    totalInvestors: number;
    averageApy: number;
    historicalData: HistoricalLiquidityData[];
  }>
> => {
  const response = await apiClient.get<
    ApiResponse<{
      totalVolume: number;
      totalInvestors: number;
      averageApy: number;
      historicalData: HistoricalLiquidityData[];
    }>
  >('/liquidity/analytics');
  return response.data;
};
