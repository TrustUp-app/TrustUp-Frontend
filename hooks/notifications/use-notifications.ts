import { useCallback, useEffect, useRef, useState } from 'react';
import type { Notification } from '../../types/Notification';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notifications.service';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  /**
   * Removes a notification from the local list.
   *
   * NOTE: The TrustUp API does not expose a delete endpoint (as of API-23/24
   * documentation). This operation is intentionally local-only and will NOT
   * persist across sessions or devices. If a delete endpoint is added in the
   * future, this function should be wired to it.
   */
  deleteNotification: (id: string) => void;
  refresh: () => void;
}

/**
 * Custom hook for fetching and managing the user's notifications.
 *
 * - Fetches from `GET /notifications` via `notifications.service.ts`.
 * - `markAsRead` / `markAllAsRead` apply optimistic updates and roll back on
 *   server failure.
 * - `deleteNotification` is local-only (no delete endpoint in the API).
 * - Falls back to a DEV seed when `EXPO_PUBLIC_API_URL` is not configured
 *   (same `isApiConfigured` pattern as loans/merchants services).
 */
export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a stable abort-controller ref so fetchNotifications can be safely
  // cancelled on unmount or when the caller calls refresh().
  const abortRef = useRef<AbortController | null>(null);

  const fetchNotifications = useCallback(() => {
    // Cancel any in-flight request before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    getNotifications({ signal: controller.signal })
      .then(({ notifications: fetched }) => {
        setNotifications(fetched);
      })
      .catch((err: unknown) => {
        // Ignore aborted requests — they are expected on unmount / refresh.
        if (err instanceof Error && err.name === 'AbortError') return;
        setError('Failed to load notifications');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchNotifications();
    return () => {
      // Cancel the in-flight request when the component unmounts.
      abortRef.current?.abort();
    };
  }, [fetchNotifications]);

  /**
   * Marks a single notification as read.
   *
   * Applies the update immediately (optimistic), then confirms with
   * `PATCH /notifications/:id/read`. Rolls back and surfaces an error on
   * failure.
   */
  const markAsRead = useCallback((id: string) => {
    let previous: Notification[] = [];
    setNotifications((prev) => {
      previous = prev;
      return prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    });

    markNotificationRead(id).catch((err: unknown) => {
      if (err instanceof Error && err.name === 'AbortError') return;
      setNotifications(previous);
      setError('Failed to mark notification as read');
    });
  }, []);

  /**
   * Marks all notifications as read.
   *
   * Applies the update immediately (optimistic), then confirms with
   * `PATCH /notifications/read-all`. Rolls back and surfaces an error on
   * failure.
   */
  const markAllAsRead = useCallback(() => {
    let previous: Notification[] = [];
    setNotifications((prev) => {
      previous = prev;
      return prev.map((n) => ({ ...n, isRead: true }));
    });

    markAllNotificationsRead().catch((err: unknown) => {
      if (err instanceof Error && err.name === 'AbortError') return;
      setNotifications(previous);
      setError('Failed to mark all notifications as read');
    });
  }, []);

  /**
   * Removes a notification from the local list.
   *
   * Local-only: the TrustUp API does not expose a delete endpoint (API-23/24).
   * No server call is made. See JSDoc on `UseNotificationsReturn.deleteNotification`.
   */
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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
