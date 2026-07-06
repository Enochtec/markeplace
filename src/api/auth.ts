import api from './axios';

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; role?: string; shopName?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data: FormData) =>
    api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};
