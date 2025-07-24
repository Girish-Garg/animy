import axios from 'axios';
import authManager from './authManager';
import { toast } from 'sonner';

const baseURL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await authManager.getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        authManager.clearToken();
        const newToken = await authManager.getValidToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Handle other HTTP errors
    if (error.response?.status === 403) {
      toast.error('Access denied. You don\'t have permission for this action.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// Utility functions for common API patterns
export const apiUtils = {
  // GET request with automatic auth
  get: (url, config = {}) => apiClient.get(url, config),
  
  // POST request with automatic auth
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  
  // PUT request with automatic auth
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  
  // DELETE request with automatic auth
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // PATCH request with automatic auth
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
};

export default apiClient;
