/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * API error response structure
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Authentication response after login/signup
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * User profile data
 */
export interface User {
  id: string;
  username: string;
  displayName: string;
  walletAddress: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sign in credentials
 */
export interface SignInCredentials {
  username: string;
  password: string;
}

/**
 * Create account payload
 */
export interface CreateAccountPayload {
  username: string;
  displayName: string;
  walletAddress: string;
  password: string;
  profileImage?: string;
}

/**
 * Loan status types
 */
export type LoanStatus = 'pending' | 'active' | 'completed' | 'defaulted';

/**
 * Loan data structure
 */
export interface Loan {
  id: string;
  borrowerId: string;
  amount: number;
  interestRate: number;
  duration: number;
  status: LoanStatus;
  purpose?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create loan request payload
 */
export interface CreateLoanRequest {
  amount: number;
  duration: number;
  purpose?: string;
}

/**
 * Merchant data structure
 */
export interface Merchant {
  id: string;
  name: string;
  address: string;
  category: string;
  rating?: number;
  logo?: string;
  createdAt: string;
}

/**
 * Payment transaction structure
 */
export interface Payment {
  id: string;
  userId: string;
  merchantId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create payment request payload
 */
export interface CreatePaymentRequest {
  merchantId: string;
  amount: number;
}

/**
 * Liquidity pool data structure
 */
export interface LiquidityPool {
  id: string;
  totalLiquidity: number;
  availableLiquidity: number;
  apy: number;
  updatedAt: string;
}

/**
 * Invest/deposit request payload
 */
export interface InvestRequest {
  amount: number;
}

/**
 * Investment record
 */
export interface Investment {
  id: string;
  userId: string;
  amount: number;
  apy: number;
  startDate: string;
  status: 'active' | 'withdrawn';
}

/**
 * Notification types
 */
export type NotificationType =
  | 'loan_approved'
  | 'loan_rejected'
  | 'payment_received'
  | 'payment_failed'
  | 'investment_matured'
  | 'system';

/**
 * Notification structure
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Query parameters for paginated requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Loan query parameters
 */
export interface LoanQueryParams extends PaginationParams {
  status?: LoanStatus;
  sortBy?: 'createdAt' | 'amount' | 'interestRate';
  sortOrder?: 'asc' | 'desc';
}
