import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('airbooking_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login/') &&
      !originalRequest.url.includes('/auth/register/')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('airbooking_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(
            (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api') + '/auth/token/refresh/',
            { refresh: refreshToken }
          );
          const newAccessToken = res.data.access;
          localStorage.setItem('airbooking_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('airbooking_access_token');
          localStorage.removeItem('airbooking_refresh_token');
          localStorage.removeItem('airbooking_user');
          window.location.href = '/login?session_expired=true';
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
