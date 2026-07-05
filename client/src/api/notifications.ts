import api from './axios';

export const notificationsApi = {
  get: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/all/read'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  send: (data: Record<string, unknown>) => api.post('/notifications/send', data),
  broadcast: (data: Record<string, unknown>) => api.post('/notifications/broadcast', data),
};
