import api from './axios';

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  toggle: (productId: string) => api.post('/wishlist', { productId }),
  remove: (id: string) => api.delete(`/wishlist/${id}`),
  check: (productId: string) => api.get(`/wishlist/check/${productId}`),
};
