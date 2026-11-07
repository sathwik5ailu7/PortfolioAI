import axios from 'axios';

// In production, use VITE_API_URL or default to relative /api
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portfolio_ai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/portfolio/')) {
        localStorage.removeItem('portfolio_ai_token');
        localStorage.removeItem('portfolio_ai_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
