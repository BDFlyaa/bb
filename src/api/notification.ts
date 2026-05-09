import request from '../utils/request';

export interface NotificationItem {
  id: number;
  userId: number;
  type: 'checkin_approved' | 'checkin_rejected' | 'order_shipped' | 'order_cancelled' | 'community_like' | 'community_comment' | 'system';
  title: string;
  content: string;
  isRead: boolean;
  relatedId: number | null;
  relatedType: 'checkin' | 'order' | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListData {
  list: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UnreadCountData {
  count: number;
}

// 获取未读通知数量
export function getUnreadCount() {
  return request.get<any, { success: boolean; data: UnreadCountData }>('/notifications/unread-count');
}

// 获取通知列表
export function getNotifications(params?: { page?: number; pageSize?: number; isRead?: boolean }) {
  return request.get<any, { success: boolean; data: NotificationListData }>('/notifications', { params });
}

// 标记单条已读
export function markAsRead(id: number) {
  return request.put<any, { success: boolean; data: { id: number; isRead: boolean } }>(`/notifications/${id}/read`);
}

// 全部标记已读
export function markAllAsRead() {
  return request.put<any, { success: boolean; data: { affected: number } }>('/notifications/read-all');
}

// 删除通知
export function deleteNotification(id: number) {
  return request.delete<any, { success: boolean }>(`/notifications/${id}`);
}
