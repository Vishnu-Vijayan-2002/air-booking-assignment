import api from './client';

export const adminApi = {
  getPendingUsers: () => api.get('/admin/users/pending/'),
  approveUser: (id) => api.post(`/admin/users/${id}/approve/`),
  rejectUser: (id, reason) => api.post(`/admin/users/${id}/reject/`, { reason }),
  getAllUsers: (params) => api.get('/admin/users/', { params }),

  getFlights: () => api.get('/admin/flights/'),
  createFlight: (flightData) => api.post('/admin/flights/', flightData),
  getFlightDetail: (id) => api.get(`/admin/flights/${id}/`),
  updateFlight: (id, flightData) => api.put(`/admin/flights/${id}/`, flightData),
  updateFlightStatus: (id, statusData) => api.put(`/admin/flights/${id}/status/`, statusData),
  deleteFlight: (id) => api.delete(`/admin/flights/${id}/`),

  getStats: () => api.get('/admin/stats/'),
};
