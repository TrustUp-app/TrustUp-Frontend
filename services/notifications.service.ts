import { apiClient, isApiConfigured } from '../lib/api-client';
import type { ApiNotificationsResponse, MarkAllReadResponse, MarkReadResponse } from '../types/api';
import {
  formatRelativeTime,
  mapApiNotificationType,
  type Notification,
  type NotificationsResponse,
} from '../types/Notification';

// ─── Dev seeds ────────────────────────────────────────────────────────────────
// Used ONLY when no API base URL is configured (`isApiConfigured === false`).
// Shaped to the real backend DTO so the UI can be reviewed without a server.
// MUST NOT be relied on in production.

const DEV_API_NOTIFICATIONS: ApiNotificationsResponse = {
  notifications: [
    {
      id: '1',
      type: 'loan_reminder',
      title: 'Payment Due Soon',
      message: "Your $50.00 payment is due in 3 days. Don't miss it!",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
      data: { loanId: 'loan-123', amount: 50 },
    },
    {
      id: '2',
      type: 'credit_update',
      title: 'Credit Increased',
      message: 'Great news! Your available credit increased to $320.00.',
      isRead: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    },
    {
      id: '3',
      type: 'merchant_update',
      title: 'New Merchant Available',
      message: 'TechStore has joined TrustUp. Shop with BNPL now.',
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    },
    {
      id: '4',
      type: 'reputation_update',
      title: 'Reputation Updated',
      message: 'Your reputation score improved to 82/100. Keep it up!',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
    },
    {
      id: '5',
      type: 'security',
      title: 'Terms Updated',
      message: "We've updated our privacy policy. Tap to review the changes.",
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
  ],
  total: 5,
  unreadCount: 3,
  limit: 20,
  offset: 0,
};

// ─── Mapping helper ───────────────────────────────────────────────────────────

/**
 * Converts a raw `ApiNotificationsResponse` into the UI-facing
 * `NotificationsResponse`, mapping:
 * - `message`   → `body`
 * - `createdAt` → `timestamp` (human-relative string)
 * - `type`      → UI bucket via `mapApiNotificationType`
 */
function mapApiResponse(raw: ApiNotificationsResponse): NotificationsResponse {
  const notifications: Notification[] = raw.notifications.map((n) => ({
    id: n.id,
    type: mapApiNotificationType(n.type),
    title: n.title,
    body: n.message,
    timestamp: formatRelativeTime(n.createdAt),
    isRead: n.isRead,
  }));
  return { notifications, unreadCount: raw.unreadCount };
}

// ─── Service functions ────────────────────────────────────────────────────────

export interface GetNotificationsParams {
  unread?: boolean;
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

/**
 * `GET /notifications` — paginated notifications for the authenticated user.
 *
 * Falls back to a named DEV seed when `EXPO_PUBLIC_API_URL` is not set
 * (same `isApiConfigured` pattern as the loans and merchants services).
 *
 * NOTE: the backend endpoints are marked "Not Implemented" (API-23/24).
 * The DEV seed ensures the UI can be developed and reviewed without a server.
 */
export async function getNotifications({
  unread,
  limit = 20,
  offset = 0,
  signal,
}: GetNotificationsParams = {}): Promise<NotificationsResponse> {
  if (!isApiConfigured) {
    const seed = DEV_API_NOTIFICATIONS;
    const filtered =
      unread === true ? seed.notifications.filter((n) => !n.isRead) : seed.notifications;
    const sliced = filtered.slice(offset, offset + limit);
    const devRaw: ApiNotificationsResponse = {
      notifications: sliced,
      total: filtered.length,
      unreadCount: seed.notifications.filter((n) => !n.isRead).length,
      limit,
      offset,
    };
    return mapApiResponse(devRaw);
  }

  const raw = await apiClient.get<ApiNotificationsResponse>('/notifications', {
    params: { unread, limit, offset },
    signal,
  });
  return mapApiResponse(raw);
}

/**
 * `PATCH /notifications/:id/read` — mark a single notification as read.
 *
 * Returns `{ success: true }` on success.
 * The caller (hook) is responsible for optimistic updates and rollback.
 */
export async function markNotificationRead(
  id: string,
  signal?: AbortSignal
): Promise<MarkReadResponse> {
  if (!isApiConfigured) {
    return { success: true };
  }
  return apiClient.patch<MarkReadResponse>(`/notifications/${id}/read`, undefined, { signal });
}

/**
 * `PATCH /notifications/read-all` — mark all notifications as read.
 *
 * Returns `{ success: true, updatedCount }` on success.
 * The caller (hook) is responsible for optimistic updates and rollback.
 */
export async function markAllNotificationsRead(signal?: AbortSignal): Promise<MarkAllReadResponse> {
  if (!isApiConfigured) {
    return { success: true, updatedCount: 0 };
  }
  return apiClient.patch<MarkAllReadResponse>('/notifications/read-all', undefined, { signal });
}
