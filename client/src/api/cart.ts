import api from './axios';

export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId: string, quantity = 1) => api.post('/cart', { productId, quantity }),
  update: (id: string, quantity: number) => api.put(`/cart/${id}`, { quantity }),
  remove: (id: string) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart/clear'),
};
