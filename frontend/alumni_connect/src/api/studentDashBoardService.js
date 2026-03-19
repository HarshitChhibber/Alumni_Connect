import api from './axios'; // Your configured axios instance

// GET: Fetch all aggregated dashboard data
export const fetchStudentDashboard = async () => {
  const response = await api.get('/students/dashboard');
  return response.data;
};

// POST: Heartbeat to track minutes spent (Call this every 60s)
export const trackUserActivity = async () => {
  const response = await api.post('/students/activity/heartbeat');
  return response.data;
};