import api from './axios';

export const categoriesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/categories', { params }),
  getAllAdmin: () => api.get('/categories/admin/all'),
  getById: (id: string) => api.get(`/categories/${id}`),

  create: (data: FormData) =>
    api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id: string, data: FormData) =>
    api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  delete: (id: string) => api.delete(`/categories/${id}`),
};
