import { apiFetch } from '../lib/api';
import type { Notification } from '../types/Notification';

interface ApiNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface NotificationsResponse {
  notifications: ApiNotification[];
}

function mapDto(n: ApiNotification): Notification {
  return {
    id: n.id,
    type: n.type as Notification['type'],
    title: n.title,
    body: n.body,
    timestamp: formatTime(n.createdAt),
    isRead: n.read,
  };
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const notificationsService = {
  async getAll(): Promise<{ notifications: Notification[] }> {
    const res = await apiFetch<NotificationsResponse>('/notifications');
    return { notifications: res.notifications.map(mapDto) };
  },

  async markAsRead(id: string): Promise<void> {
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllAsRead(): Promise<void> {
    await apiFetch('/notifications/read-all', { method: 'PATCH' });
  },
};
