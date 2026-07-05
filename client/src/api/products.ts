import api from './axios';

export const productsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getFeatured: (limit = 8) => api.get('/products/featured', { params: { limit } }),
  getLatest: (limit = 12) => api.get('/products/latest', { params: { limit } }),
  getMine: (params?: Record<string, unknown>) => api.get('/products/shop/mine', { params }),
  getAllAdmin: (params?: Record<string, unknown>) => api.get('/products/admin/all', { params }),

  create: (data: FormData) =>
    api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  delete: (id: string) => api.delete(`/products/${id}`),
  deleteImage: (imageId: string) => api.delete(`/products/images/${imageId}`),
  toggleFeatured: (id: string) => api.patch(`/products/admin/${id}/featured`),
};
