export type NotificationType = 'payment' | 'credit' | 'merchant' | 'reputation' | 'security';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

/**
 * Response shape from `GET /notifications`.
 */
export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}
