import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if already on login/register pages
      if (typeof window !== 'undefined' && 
          (window.location.pathname === '/login' || window.location.pathname === '/register')) {
        return Promise.reject(error.response?.data || error);
      }
      
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {
        // ignore storage errors
      }
      
      if (typeof window !== 'undefined') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Wrapper function to maintain compatibility with existing code
export async function request(path, options = {}) {
  const { method = 'GET', headers, body, ...restOptions } = options;
  
  const config = {
    url: path,
    method,
    headers,
    ...restOptions,
  };

  // Handle body/data
  if (body) {
    if (body instanceof FormData) {
      config.data = body;
      // Remove Content-Type header to let axios set it with boundary
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    } else if (typeof body === 'string') {
      try {
        config.data = JSON.parse(body);
      } catch {
        config.data = body;
      }
    } else {
      config.data = body;
    }
  }

  const response = await axiosInstance(config);
  return response.data;
}

export default { request, API_BASE, axiosInstance };
