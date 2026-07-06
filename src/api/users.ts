import api from './axios';

export const usersApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  toggle: (id: string) => api.patch(`/users/${id}/toggle-status`),
  delete: (id: string) => api.delete(`/users/${id}`),
};
