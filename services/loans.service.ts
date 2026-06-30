import { apiClient } from '../lib/api-client';
import {
  ApiResponse,
  Loan,
  CreateLoanRequest,
  PaginatedResponse,
  LoanQueryParams,
} from '../types/api';

/**
 * Loans Service
 * Handles all loan-related API calls
 */

/**
 * Get all loans with optional filtering and pagination
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of loans
 */
export const getLoans = async (
  params?: LoanQueryParams
): Promise<ApiResponse<PaginatedResponse<Loan>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Loan>>>('/loans', {
    params,
  });
  return response.data;
};

/**
 * Get loans for the current user
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of user's loans
 */
export const getMyLoans = async (
  params?: LoanQueryParams
): Promise<ApiResponse<PaginatedResponse<Loan>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Loan>>>('/loans', {
    params: {
      ...params,
      mine: true, // Query parameter to filter user's loans
    },
  });
  return response.data;
};

/**
 * Get a specific loan by ID
 * @param loanId - Loan identifier
 * @returns Loan details
 */
export const getLoanById = async (loanId: string): Promise<ApiResponse<Loan>> => {
  const response = await apiClient.get<ApiResponse<Loan>>(`/loans/${loanId}`);
  return response.data;
};

/**
 * Create a new loan request
 * @param loanData - Loan request details
 * @returns Created loan
 */
export const createLoan = async (loanData: CreateLoanRequest): Promise<ApiResponse<Loan>> => {
  const response = await apiClient.post<ApiResponse<Loan>>('/loans', loanData);
  return response.data;
};

/**
 * Update an existing loan
 * @param loanId - Loan identifier
 * @param updates - Fields to update
 * @returns Updated loan
 */
export const updateLoan = async (
  loanId: string,
  updates: Partial<CreateLoanRequest>
): Promise<ApiResponse<Loan>> => {
  const response = await apiClient.patch<ApiResponse<Loan>>(`/loans/${loanId}`, updates);
  return response.data;
};

/**
 * Cancel a pending loan request
 * @param loanId - Loan identifier
 * @returns Success message
 */
export const cancelLoan = async (loanId: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/loans/${loanId}`);
  return response.data;
};

/**
 * Repay a loan
 * @param loanId - Loan identifier
 * @param amount - Repayment amount
 * @returns Updated loan with repayment details
 */
export const repayLoan = async (loanId: string, amount: number): Promise<ApiResponse<Loan>> => {
  const response = await apiClient.post<ApiResponse<Loan>>(`/loans/${loanId}/repay`, {
    amount,
  });
  return response.data;
};

/**
 * Get repayment schedule details
 */
export interface LoanScheduleItem {
  dueDate: string;
  amount: number;
}

/**
 * Get loan repayment schedule
 * @param loanId - Loan identifier
 * @returns Repayment schedule details
 */
export const getLoanSchedule = async (
  loanId: string
): Promise<ApiResponse<{ schedule: LoanScheduleItem[] }>> => {
  const response = await apiClient.get<ApiResponse<{ schedule: LoanScheduleItem[] }>>(
    `/loans/${loanId}/schedule`
  );
  return response.data;
};

/**
 * Get loan statistics for the current user
 * @returns User's loan statistics
 */
export const getLoanStats = async (): Promise<
  ApiResponse<{
    totalLoans: number;
    activeLoans: number;
    totalBorrowed: number;
    totalRepaid: number;
  }>
> => {
  const response = await apiClient.get<
    ApiResponse<{
      totalLoans: number;
      activeLoans: number;
      totalBorrowed: number;
      totalRepaid: number;
    }>
  >('/loans/stats');
  return response.data;
};
