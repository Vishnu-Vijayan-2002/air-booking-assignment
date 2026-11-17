import api from './client';

export const authApi = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  getProfile: () => api.get('/auth/me/'),
  updateProfile: (profileData) => api.patch('/auth/me/', profileData),
  getActivationEmailLogs: () => api.get('/auth/activation-emails/'),
};
