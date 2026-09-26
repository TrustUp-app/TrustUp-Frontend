import { useCallback, useEffect, useState } from 'react';
import type { Notification } from '../../types/Notification';
import { notificationsService } from '../../services/notifications.service';
import { isApiConfigured } from '../../lib/api';

const DEV_MOCK: Notification[] = [
  { id: '1', type: 'payment', title: 'Payment Due Soon', body: 'Your $50.00 payment is due in 3 days.', timestamp: '2 min ago', isRead: false },
  { id: '2', type: 'credit', title: 'Credit Increased', body: 'Your credit increased to $320.00.', timestamp: '1 hour ago', isRead: false },
  { id: '3', type: 'merchant', title: 'New Merchant Available', body: 'TechStore has joined TrustUp. Shop with BNPL now.', timestamp: '3 hours ago', isRead: false },
  { id: '4', type: 'reputation', title: 'Reputation Updated', body: 'Your reputation score improved to 82/100. Keep it up!', timestamp: 'Yesterday', isRead: true },
  { id: '5', type: 'security', title: 'Terms Updated', body: "We've updated our privacy policy. Tap to review the changes.", timestamp: '3 days ago', isRead: false },
];

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        setNotifications(DEV_MOCK);
        return;
      }
      const { notifications: apiData } = await notificationsService.getAll();
      setNotifications(apiData);
    } catch {
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    let previous: Notification[] = [];
    setNotifications(prev => {
      previous = prev;
      return prev.map(n => (n.id === id? {...n, isRead: true } : n));
    });
    notificationsService.markAsRead(id).catch(() => {
      setNotifications(previous);
      setError('Failed to mark as read');
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    let previous: Notification[] = [];
    setNotifications(prev => {
      previous = prev;
      return prev.map(n => ({...n, isRead: true }));
    });
    notificationsService.markAllAsRead().catch(() => {
      setNotifications(previous);
      setError('Failed to mark all as read');
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id!== id));
  }, []);

  const unreadCount = notifications.reduce((c, n) => (n.isRead? c : c + 1), 0);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
