import api from './axios';

// ==========================================
// ALUMNI & ADMIN (MANAGEMENT)
// ==========================================

// 1. Create Online Workshop (Published immediately)
export const createWorkshop = async (formData) => {
  // Config for file upload
  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  const response = await api.post('/workshops', formData, config);
  return response.data;
};

// 2. Request Offline Workshop (Venue Request - Pending Approval) [NEW]
export const requestVenue = async (data) => {
  // 'data' is a plain JS object: { title, description, date, time, requirements, capacity }
  const response = await api.post('/workshops/request-venue', data);
  return response.data;
};

// 3. Fetch Workshops 
// For Alumni: Returns "My Created" workshops.
// For Admin: Returns ALL workshops for the university.
export const fetchWorkshops = async (tab = 'upcoming') => {
  const response = await api.get(`/workshops/my-created?tab=${tab}`);
  return response.data;
};

export const deleteWorkshop = async (id) => {
  const response = await api.delete(`/workshops/${id}`);
  return response.data;
};

export const fetchWorkshopStats = async () => {
  const response = await api.get('/workshops/stats');
  return response.data;
};

// ==========================================
// ADMIN ONLY (VENUE APPROVALS) [NEW]
// ==========================================

export const fetchPendingVenueRequests = async () => {
  const response = await api.get('/workshops/admin/pending-venues');
  return response.data;
};

export const approveVenueRequest = async (data) => {
  // data = { workshopId, assignedVenue, adminNote }
  const response = await api.post('/workshops/admin/approve-venue', data);
  return response.data;
};

// ==========================================
// STUDENT (PARTICIPANT)
// ==========================================

export const fetchAllWorkshops = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/workshops/explore?${params.toString()}`);
  return response.data;
};

export const fetchStudentWorkshops = async () => {
  const response = await api.get('/workshops/my-learning');
  return response.data;
};

// ==========================================
// PAYMENT & REGISTRATION
// ==========================================

// 1. Direct Register (Only works for Free workshops)
export const registerFreeWorkshop = async (workshopId) => {
  const response = await api.post(`/workshops/${workshopId}/register`);
  return response.data;
};

// 2. Create Razorpay Order (For Paid workshops)
export const createPaymentOrder = async (workshopId) => {
  const response = await api.post(`/workshops/${workshopId}/payment-order`);
  return response.data;
};

// 3. Verify Payment Signature
export const verifyPayment = async (paymentData) => {
  const response = await api.post('/workshops/verify-payment', paymentData);
  return response.data;
};