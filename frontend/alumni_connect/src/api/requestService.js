import api from './axios'; // Assuming your axios instance is here

// GET /api/alumni/requests
export const fetchMentorshipRequests = async () => {
  const response = await api.get('/alumni/requests');
  return response.data;
};

// PUT /api/alumni/requests/:id
export const updateRequestStatus = async (id, status) => {
  const response = await api.put(`/alumni/requests/${id}`, { status });
  return response.data;
};