import api from './axios'; // Assuming your configured axios instance

// GET /api/alumni/dashboard
export const fetchDashboardData = async () => {
  const response = await api.get('/alumni/dashboard');
  return response.data;
};

// GET /api/alumni/requests
export const fetchMentorshipRequests = async () => {
  const response = await api.get('/alumni/requests');
  return response.data;
};

// GET /api/alumni/recommendations
export const fetchRecommendedStudents = async () => {
  const response = await api.get('/alumni/recommendations');
  return response.data;
};

// PUT /api/alumni/requests/:id
export const updateRequestStatus = async (id, status) => {
  const response = await api.put(`/alumni/requests/${id}`, { status });
  return response.data;
};