import axios from 'axios';

// Dynamically determine and normalize API Base URL
const getApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.endsWith('/api/v1') && !cleanUrl.endsWith('/api')) {
      cleanUrl += '/api/v1';
    }
    return cleanUrl;
  }
  
  // Default fallback for Vercel production and local proxying
  return '/api/v1';
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
