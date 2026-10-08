import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
const baseURL = configuredApiUrl
  ? configuredApiUrl.endsWith('/api')
    ? configuredApiUrl
    : `${configuredApiUrl}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lostlink_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
