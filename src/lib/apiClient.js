import axios from 'axios';
import { toast } from 'sonner';
import { getAuthToken } from './tokenBridge';

const baseURL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor: attach a fresh Clerk token. getAuthToken() defers to
// Clerk's getToken(), which caches/refreshes internally, so it is safe to
// call on every request.
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Proceed without an auth header; the response interceptor handles 401s.
    }
    return config;
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

    // Handle 401: force a fresh (uncached) token once and retry.
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await getAuthToken({ skipCache: true });
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
