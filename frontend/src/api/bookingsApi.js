import api from './client';

export const bookingsApi = {
  getUserBookings: (status) => api.get('/bookings/', { params: status ? { status } : {} }),
  getBookingDetail: (id) => api.get(`/bookings/${id}/`),
  createBooking: (bookingData) => api.post('/bookings/', bookingData),
  cancelBooking: (id) => api.post(`/bookings/${id}/cancel/`),
};
