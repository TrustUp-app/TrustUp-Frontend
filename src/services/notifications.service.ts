import { apiClient } from '../lib/api-client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}

export const notificationsService = {
  list: (params?: { unread?: boolean; limit?: number; offset?: number }) =>
    apiClient.get<NotificationListResponse>('/notifications', { params }).then((r) => r.data),

  markRead: (id: string) =>
    apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    apiClient
      .patch<{ success: boolean; updatedCount: number }>('/notifications/read-all')
      .then((r) => r.data),
};
