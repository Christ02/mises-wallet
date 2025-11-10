import api from '../../../services/api';

export type NotificationType = 'success' | 'error' | 'info';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: NotificationType;
}

export async function fetchNotifications(): Promise<UserNotification[]> {
  const response = await api.get('/api/user/notifications');
  return response.data?.notifications || [];
}


