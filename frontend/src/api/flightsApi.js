import api from './client';

export const flightsApi = {
  searchFlights: (params) => api.get('/flights/search/', { params }),
  getFlightDetail: (id) => api.get(`/flights/${id}/`),
  getLiveTelemetry: (id) => api.get(`/flights/${id}/live-tracking/`),
  getAirports: () => api.get('/flights/airports/'),
};
