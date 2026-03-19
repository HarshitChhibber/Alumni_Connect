import api from './axios'; // Ensure your axios instance has the Auth Token header configured

export const fetchConversations = async () => {
  const response = await api.get('/chat/conversations');
  return response.data;
};

export const fetchMessages = async (conversationId) => {
  const response = await api.get(`/chat/${conversationId}`);
  return response.data;
};

export const sendMessage = async (recipientId, text) => {
  const response = await api.post('/chat/send', { recipientId, text });
  return response.data;
};