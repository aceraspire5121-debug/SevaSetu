import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add Authorization header token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sevasetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
