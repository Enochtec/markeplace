import api from './axios';

export const settingsApi = {
  get: (params?: Record<string, unknown>) => api.get('/settings', { params }),
  getDashboard: () => api.get('/settings/admin/dashboard'),
  upsert: (data: Record<string, unknown>) => api.post('/settings', data),
  updateBatch: (settings: Record<string, unknown>) => api.put('/settings/batch', { settings }),
  delete: (key: string) => api.delete(`/settings/${key}`),
};
