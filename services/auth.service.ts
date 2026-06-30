import { apiClient } from '../lib/api-client';
import { setTokens, clearTokens } from '../lib/token-storage';
import {
  ApiResponse,
  AuthResponse,
  SignInCredentials,
  CreateAccountPayload,
  User,
} from '../types/api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

/**
 * Sign in with username and password
 * @param credentials - Username and password
 * @returns User data and authentication tokens
 */
export const signIn = async (
  credentials: SignInCredentials
): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/signin', credentials);

  // Store tokens securely
  await setTokens({
    accessToken: response.data.data.accessToken,
    refreshToken: response.data.data.refreshToken,
  });

  return response.data;
};

/**
 * Create a new user account
 * @param payload - User registration data
 * @returns User data and authentication tokens
 */
export const createAccount = async (
  payload: CreateAccountPayload
): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/signup', payload);

  // Store tokens securely
  await setTokens({
    accessToken: response.data.data.accessToken,
    refreshToken: response.data.data.refreshToken,
  });

  return response.data;
};

/**
 * Sign out the current user
 * Clears all stored tokens
 */
export const signOut = async (): Promise<void> => {
  try {
    // Call logout endpoint (if available)
    await apiClient.post('/auth/signout');
  } catch (error) {
    console.error('Sign out API call failed:', error);
  } finally {
    // Always clear tokens, even if API call fails
    await clearTokens();
  }
};

/**
 * Get current user profile
 * @returns Current user data
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return response.data;
};

/**
 * Update user profile
 * @param updates - Fields to update
 * @returns Updated user data
 */
export const updateProfile = async (
  updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResponse<User>> => {
  const response = await apiClient.patch<ApiResponse<User>>('/auth/profile', updates);
  return response.data;
};

/**
 * Change user password
 * @param currentPassword - Current password for verification
 * @param newPassword - New password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

/**
 * Request password reset
 * @param email - Email address for password reset
 */
export const requestPasswordReset = async (
  email: string
): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', {
    email,
  });
  return response.data;
};

/**
 * Reset password with token
 * @param token - Reset token from email
 * @param newPassword - New password
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
};
