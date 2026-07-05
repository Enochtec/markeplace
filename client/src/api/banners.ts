import api from './axios';

export const bannersApi = {
  get: () => api.get('/banners'),
  getAllAdmin: () => api.get('/banners/admin/all'),
  create: (data: FormData) => api.post('/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/banners/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/banners/${id}`),
};
