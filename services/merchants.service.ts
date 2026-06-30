import { apiClient } from '../lib/api-client';
import {
  ApiResponse,
  Merchant,
  Payment,
  CreatePaymentRequest,
  PaginatedResponse,
  PaginationParams,
} from '../types/api';

/**
 * Merchants Service
 * Handles all merchant-related API calls
 */

/**
 * Get all merchants with optional pagination
 * @param params - Pagination parameters
 * @returns Paginated list of merchants
 */
export const getMerchants = async (
  params?: PaginationParams & { category?: string; search?: string }
): Promise<ApiResponse<PaginatedResponse<Merchant>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Merchant>>>('/merchants', {
    params,
  });
  return response.data;
};

/**
 * Get a specific merchant by ID
 * @param merchantId - Merchant identifier
 * @returns Merchant details
 */
export const getMerchantById = async (merchantId: string): Promise<ApiResponse<Merchant>> => {
  const response = await apiClient.get<ApiResponse<Merchant>>(`/merchants/${merchantId}`);
  return response.data;
};

/**
 * Search merchants by name or category
 * @param query - Search query
 * @param category - Optional category filter
 * @returns List of matching merchants
 */
export const searchMerchants = async (
  query: string,
  category?: string
): Promise<ApiResponse<Merchant[]>> => {
  const response = await apiClient.get<ApiResponse<Merchant[]>>('/merchants/search', {
    params: { q: query, category },
  });
  return response.data;
};

/**
 * Get merchant categories
 * @returns List of available categories
 */
export const getMerchantCategories = async (): Promise<ApiResponse<string[]>> => {
  const response = await apiClient.get<ApiResponse<string[]>>('/merchants/categories');
  return response.data;
};

/**
 * Create a payment to a merchant
 * @param paymentData - Payment details
 * @returns Created payment record
 */
export const createPayment = async (
  paymentData: CreatePaymentRequest
): Promise<ApiResponse<Payment>> => {
  const response = await apiClient.post<ApiResponse<Payment>>('/payments', paymentData);
  return response.data;
};

/**
 * Get payment history for the current user
 * @param params - Pagination parameters
 * @returns Paginated list of payments
 */
export const getPaymentHistory = async (
  params?: PaginationParams
): Promise<ApiResponse<PaginatedResponse<Payment>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Payment>>>('/payments', {
    params,
  });
  return response.data;
};

/**
 * Get a specific payment by ID
 * @param paymentId - Payment identifier
 * @returns Payment details
 */
export const getPaymentById = async (paymentId: string): Promise<ApiResponse<Payment>> => {
  const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
  return response.data;
};

/**
 * Cancel a pending payment
 * @param paymentId - Payment identifier
 * @returns Success message
 */
export const cancelPayment = async (
  paymentId: string
): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/payments/${paymentId}`
  );
  return response.data;
};

/**
 * Get payment statistics for the current user
 * @returns User's payment statistics
 */
export const getPaymentStats = async (): Promise<
  ApiResponse<{
    totalPayments: number;
    totalAmount: number;
    averageTransaction: number;
  }>
> => {
  const response = await apiClient.get<
    ApiResponse<{
      totalPayments: number;
      totalAmount: number;
      averageTransaction: number;
    }>
  >('/payments/stats');
  return response.data;
};
