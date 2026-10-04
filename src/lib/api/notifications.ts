import { api } from './client';
import { Notification } from './types';

export interface NotificationsListResponse {
  total: number;
  limit: number;
  offset: number;
  unreadCount: number;
  notifications: Notification[];
}

export const notificationsApi = {
  /**
   * Fetch current user notifications with pagination and read status filter
   */
  async getNotifications(
    limit = 20,
    offset = 0,
    isRead?: boolean,
  ): Promise<NotificationsListResponse> {
    const query = new URLSearchParams();
    query.append('limit', String(limit));
    query.append('offset', String(offset));
    if (isRead !== undefined) {
      query.append('isRead', String(isRead));
    }

    return api.get<NotificationsListResponse>(
      `/notifications?${query.toString()}`,
    );
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    return api.get<{ unreadCount: number }>('/notifications/unread-count');
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    return api.patch<Notification>(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string; count: number }> {
    return api.patch<{ message: string; count: number }>(
      '/notifications/read-all',
    );
  },
};
