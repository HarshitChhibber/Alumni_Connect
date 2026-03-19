import api from './axios';

// Get students with filters
export const fetchStudents = async (filters) => {
  // filters object: { search, year, branch, minReadiness }
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.year && filters.year !== 'All') params.append('year', filters.year);
  if (filters.branch && filters.branch !== 'All Branches') params.append('branch', filters.branch);
  if (filters.minReadiness > 0) params.append('minReadiness', filters.minReadiness);

  const response = await api.get(`/students/explore?${params.toString()}`);
  return response.data;
};

// Send message to student
export const sendMessageToStudent = async (studentId, message) => {
  const response = await api.post('/students/contact', { studentId, message });
  return response.data;
};