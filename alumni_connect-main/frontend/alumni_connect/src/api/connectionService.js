import api from './axios'; // Ensure you have your axios instance configured

// 1. Send a connection request
export const sendConnectionRequest = async (receiverId, message) => {
  // Matches route: router.post('/send', ...)
  const response = await api.post('/connections/send', { receiverId, message });
  return response.data;
};

// 2. Accept a request (For your "Incoming Requests" page later)
export const acceptConnectionRequest = async (requestId) => {
  // Matches route: router.post('/accept', ...)
  const response = await api.post('/connections/accept', { requestId });
  return response.data;
};

// 3. Fetch pending requests (For your "Incoming Requests" page later)
export const fetchPendingRequests = async () => {
  const response = await api.get('/connections/pending');
  return response.data;
};

// ============= NEW METHODS FOR QUICK CONNECT VIA NOTIFICATIONS =============

// 4. Send connection request via notification (REST API fallback)
export const sendConnectionRequestViaNotification = async (alumniId, message) => {
  const response = await api.post('/notifications/send-connection-request', {
    alumniId,
    message
  });
  return response.data;
};

// 5. Accept connection request via notification (for alumni)
export const acceptConnectionRequestViaNotification = async (studentId) => {
  const response = await api.post('/notifications/accept-connection-request', {
    studentId
  });
  return response.data;
};

// 6. Get notification history
export const getNotificationHistory = async () => {
  const response = await api.get('/notifications/history');
  return response.data;
};

// 7. Clear a notification
export const clearNotification = async (alumniId) => {
  const response = await api.post('/notifications/clear', { alumniId });
  return response.data;
};
