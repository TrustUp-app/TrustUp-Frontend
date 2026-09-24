import { apiFetch, isApiConfigured } from '../lib/api';
import type { Notification } from '../types/Notification';

type ApiNotification = {
  id: string;
  type: string;
  title: string;
  body?: string;
  message?: string;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  timestamp?: string;
};

type NotificationsResponse = {
  data: ApiNotification[];
  unreadCount?: number;
};

function mapApiToUi(n: ApiNotification): Notification {
  return {
    id: n.id,
    type: n.type as Notification['type'],
    title: n.title,
    body: n.body?? n.message?? '',
    timestamp: n.createdAt? new Date(n.createdAt).toLocaleString() : n.timestamp?? 'Just now',
    isRead: n.read?? n.isRead?? false,
  };
}

export const notificationsService = {
  async getAll(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    if (!isApiConfigured()) {
      throw new Error('API not configured');
    }
    const res = await apiFetch<NotificationsResponse | ApiNotification[]>('/notifications');
    const list = Array.isArray(res)? res : res.data;
    const mapped = list.map(mapApiToUi);
    const unread = Array.isArray(res) &&!Array.isArray(res)? res.unreadCount : undefined;
    const unreadCount = unread?? mapped.filter(m =>!m.isRead).length;
    return { notifications: mapped, unreadCount };
  },

  async markAsRead(id: string): Promise<void> {
    if (!isApiConfigured()) return;
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllAsRead(): Promise<void> {
    if (!isApiConfigured()) return;
    await apiFetch('/notifications/read-all', { method: 'PATCH' });
  },
};
