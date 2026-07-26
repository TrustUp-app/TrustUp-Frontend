import { useCallback, useEffect, useState } from 'react';
import type { Notification } from '../../types/Notification';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Due Soon',
    body: "Your $50.00 payment is due in 3 days. Don't miss it!",
    timestamp: '2 min ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'credit',
    title: 'Credit Increased',
    body: 'Great news! Your available credit increased to $320.00.',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'merchant',
    title: 'New Merchant Available',
    body: 'TechStore has joined TrustUp. Shop with BNPL now.',
    timestamp: '3 hours ago',
    isRead: false,
  },
  {
    id: '4',
    type: 'reputation',
    title: 'Reputation Updated',
    body: 'Your reputation score improved to 82/100. Keep it up!',
    timestamp: 'Yesterday',
    isRead: true,
  },
  {
    id: '5',
    type: 'security',
    title: 'Terms Updated',
    body: "We've updated our privacy policy. Tap to review the changes.",
    timestamp: '3 days ago',
    isRead: true,
  },
];

/** Simulates network latency for the mocked endpoints below. */
const simulateRequest = <T>(result: T, delay = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(result), delay));

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refresh: () => void;
}

/**
 * Custom hook for fetching and managing the user's notifications.
 *
 * @todo Replace the mock calls below with real network calls once the API
 *   is available:
 *   - `GET /notifications` (supports `?unread=true`)
 *   - `PATCH /notifications/{id}/read`
 *   - `PATCH /notifications/read-all`
 *
 * Until then, this hook simulates network delay with `setTimeout` so the
 * panel's loading/empty states and optimistic updates can be built and
 * reviewed. It MUST NOT ship to production in this state.
 */
export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(() => {
    setIsLoading(true);
    setError(null);

    // TODO: replace with `apiFetch<NotificationsResponse>('/notifications')`
    simulateRequest(MOCK_NOTIFICATIONS)
      .then(setNotifications)
      .catch(() => setError('Failed to load notifications'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    let previous: Notification[] = [];
    setNotifications((prev) => {
      previous = prev;
      return prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    });

    // TODO: replace with `apiFetch(`/notifications/${id}/read`, { method: 'PATCH' })`
    simulateRequest(null).catch(() => {
      setNotifications(previous);
      setError('Failed to mark notification as read');
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    let previous: Notification[] = [];
    setNotifications((prev) => {
      previous = prev;
      return prev.map((n) => ({ ...n, isRead: true }));
    });

    // TODO: replace with `apiFetch('/notifications/read-all', { method: 'PATCH' })`
    simulateRequest(null).catch(() => {
      setNotifications(previous);
      setError('Failed to mark all notifications as read');
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    let previous: Notification[] = [];
    setNotifications((prev) => {
      previous = prev;
      return prev.filter((n) => n.id !== id);
    });

    // No delete endpoint is documented yet — this stays local-only for now.
    simulateRequest(null).catch(() => {
      setNotifications(previous);
      setError('Failed to delete notification');
    });
  }, []);

  const unreadCount = notifications.reduce((count, n) => (n.isRead ? count : count + 1), 0);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
};
