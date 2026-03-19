import axios from 'axios';

// 1. Create Axios Instance
const api = axios.create({
  baseURL: '/api', // Change this to process.env.REACT_APP_API_URL in production
});

// 2. Request Interceptor (Attach Token automatically)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor (Handle Token Expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optional: window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;