import api from './axios';

export const ordersApi = {
  create: (data: Record<string, unknown>) => api.post('/orders', data),
  getMy: (params?: Record<string, unknown>) => api.get('/orders/my', { params }),
  getMyById: (id: string) => api.get(`/orders/my/${id}`),
  getShopOrders: (params?: Record<string, unknown>) => api.get('/orders/shop', { params }),
  updateStatus: (id: string, status: string) => api.patch(`/orders/shop/${id}/status`, { status }),
  getAllAdmin: (params?: Record<string, unknown>) => api.get('/orders/admin/all', { params }),
  getStats: () => api.get('/orders/admin/stats'),
};
