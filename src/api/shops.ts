import api from './axios';

export const shopsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/shops', { params }),
  getById: (id: string) => api.get(`/shops/${id}`),
  getPopular: () => api.get('/shops/popular'),
  getMyShop: () => api.get('/shops/owner/dashboard'),
  getMyCustomers: (params?: Record<string, unknown>) => api.get('/shops/owner/customers', { params }),

  updateMyShop: (data: FormData) =>
    api.put('/shops/owner/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Admin
  register: (data: Record<string, unknown>) => api.post('/shops/admin/register', data),
  updateStatus: (id: string, status: string) => api.patch(`/shops/admin/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/shops/admin/${id}`),
};
