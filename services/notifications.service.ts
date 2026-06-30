import { apiClient } from '../lib/api-client';
import { ApiResponse, Notification, PaginatedResponse, PaginationParams } from '../types/api';

/**
 * Notifications Service
 * Handles all notification-related API calls
 */

/**
 * Get all notifications for the current user
 * @param params - Pagination and filter parameters
 * @returns Paginated list of notifications
 */
export const getNotifications = async (
  params?: PaginationParams & { unreadOnly?: boolean }
): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>(
    '/notifications',
    { params }
  );
  return response.data;
};

/**
 * Get a specific notification by ID
 * @param notificationId - Notification identifier
 * @returns Notification details
 */
export const getNotificationById = async (
  notificationId: string
): Promise<ApiResponse<Notification>> => {
  const response = await apiClient.get<ApiResponse<Notification>>(
    `/notifications/${notificationId}`
  );
  return response.data;
};

/**
 * Mark a notification as read
 * @param notificationId - Notification identifier
 * @returns Updated notification
 */
export const markAsRead = async (notificationId: string): Promise<ApiResponse<Notification>> => {
  const response = await apiClient.patch<ApiResponse<Notification>>(
    `/notifications/${notificationId}/read`
  );
  return response.data;
};

/**
 * Mark a notification as unread
 * @param notificationId - Notification identifier
 * @returns Updated notification
 */
export const markAsUnread = async (notificationId: string): Promise<ApiResponse<Notification>> => {
  const response = await apiClient.patch<ApiResponse<Notification>>(
    `/notifications/${notificationId}/unread`
  );
  return response.data;
};

/**
 * Mark all notifications as read
 * @returns Success message
 */
export const markAllAsRead = async (): Promise<ApiResponse<{ message: string; count: number }>> => {
  const response =
    await apiClient.patch<ApiResponse<{ message: string; count: number }>>(
      '/notifications/read-all'
    );
  return response.data;
};

/**
 * Delete a notification
 * @param notificationId - Notification identifier
 * @returns Success message
 */
export const deleteNotification = async (
  notificationId: string
): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/notifications/${notificationId}`
  );
  return response.data;
};

/**
 * Delete all notifications
 * @returns Success message with count
 */
export const deleteAllNotifications = async (): Promise<
  ApiResponse<{ message: string; count: number }>
> => {
  const response =
    await apiClient.delete<ApiResponse<{ message: string; count: number }>>('/notifications');
  return response.data;
};

/**
 * Get unread notification count
 * @returns Count of unread notifications
 */
export const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
  const response = await apiClient.get<ApiResponse<{ count: number }>>(
    '/notifications/unread-count'
  );
  return response.data;
};

/**
 * Get notification preferences
 * @returns User's notification preferences
 */
export const getNotificationPreferences = async (): Promise<
  ApiResponse<{
    email: boolean;
    push: boolean;
    sms: boolean;
    preferences: Record<string, boolean>;
  }>
> => {
  const response = await apiClient.get<
    ApiResponse<{
      email: boolean;
      push: boolean;
      sms: boolean;
      preferences: Record<string, boolean>;
    }>
  >('/notifications/preferences');
  return response.data;
};

/**
 * Update notification preferences
 * @param preferences - Updated preference settings
 * @returns Updated preferences
 */
export const updateNotificationPreferences = async (preferences: {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  preferences?: Record<string, boolean>;
}): Promise<
  ApiResponse<{
    email: boolean;
    push: boolean;
    sms: boolean;
    preferences: Record<string, boolean>;
  }>
> => {
  const response = await apiClient.patch<
    ApiResponse<{
      email: boolean;
      push: boolean;
      sms: boolean;
      preferences: Record<string, boolean>;
    }>
  >('/notifications/preferences', preferences);
  return response.data;
};
