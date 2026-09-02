import axios from 'axios';

// Dynamically determine and normalize API Base URL
const getApiBaseUrl = () => {
  // In browser, always use relative /api/v1 to route through same-origin proxy and avoid CORS preflight blocks
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }

  let envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.endsWith('/api/v1') && !cleanUrl.endsWith('/api')) {
      cleanUrl += '/api/v1';
    }
    return cleanUrl;
  }
  
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
