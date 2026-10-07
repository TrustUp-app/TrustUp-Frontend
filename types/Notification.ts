import type { ApiNotificationType } from './api';

/**
 * UI-facing notification type union.
 *
 * Maps backend snake_case type strings to the icon/colour buckets used by
 * `NotificationsPanel`. New backend types fall through to the `'other'`
 * bucket — `getIconConfig` handles it via its `default` case.
 */
export type NotificationType =
  | 'payment'
  | 'credit'
  | 'merchant'
  | 'reputation'
  | 'security'
  | 'other';

/**
 * Maps a raw backend `type` string to the UI `NotificationType` bucket.
 *
 * @example
 *   mapApiNotificationType('loan_reminder')  // → 'payment'
 *   mapApiNotificationType('credit_update')  // → 'credit'
 */
export function mapApiNotificationType(apiType: ApiNotificationType): NotificationType {
  if (apiType === 'loan_reminder' || apiType === 'payment_due' || apiType === 'payment_received') {
    return 'payment';
  }
  if (apiType === 'credit_update') return 'credit';
  if (apiType === 'merchant_update') return 'merchant';
  if (apiType === 'reputation_update') return 'reputation';
  if (apiType === 'security') return 'security';
  return 'other';
}

/**
 * UI notification model consumed by `useNotifications`, `NotificationsPanel`,
 * and `Header`.
 *
 * Field naming:
 * - `body`      — display text (backend DTO uses `message`; the mapping
 *                 happens in `notifications.service.ts`).
 * - `timestamp` — human-readable relative string (e.g. "2 min ago");
 *                 derived from the backend's ISO-8601 `createdAt`.
 *
 * Keeping `body` / `timestamp` here avoids changing every consumer; the
 * service layer is responsible for the translation.
 */
export interface Notification {
  id: string;
  /** UI bucket — mapped from the backend's snake_case `type` field. */
  type: NotificationType;
  title: string;
  /** Display text, mapped from the backend `message` field. */
  body: string;
  /** Human-readable relative time, derived from the backend `createdAt` ISO-8601 field. */
  timestamp: string;
  isRead: boolean;
}

/**
 * Formats an ISO-8601 timestamp into a human-readable relative string.
 *
 * Examples: "just now", "5 min ago", "2 hours ago", "Yesterday", "3 days ago",
 * "1 Jan 2026".
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  let past: number;
  try {
    past = new Date(isoTimestamp).getTime();
  } catch {
    return isoTimestamp;
  }
  if (isNaN(past)) return isoTimestamp;

  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;

  // Older than a week — show a short date
  return new Date(past).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Response shape from `GET /notifications` as consumed by the hook (after
 * mapping from the raw API response).
 */
export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}
