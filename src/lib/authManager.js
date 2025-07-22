import { toast } from 'sonner';

class AuthManager {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.getTokenCallback = null;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Initialize the auth manager with Clerk's getToken function
  initialize(getTokenCallback) {
    this.getTokenCallback = getTokenCallback;
  }

  // Process failed requests queue
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Check if current token is valid
  isTokenValid() {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }
    
    // Check if token expires in the next 5 minutes (300000ms)
    // This ensures we refresh before actual expiry
    const timeBuffer = 5 * 60 * 1000; // 5 minutes
    return Date.now() < (this.tokenExpiry - timeBuffer);
  }

  // Get a valid token (cached or fresh)
  async getValidToken() {
    // Return cached token if still valid
    if (this.isTokenValid()) {
      return this.token;
    }

    // If already refreshing, queue this request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      if (!this.getTokenCallback) {
        throw new Error('Auth manager not initialized');
      }

      const newToken = await this.getTokenCallback();
      
      if (!newToken) {
        throw new Error('Failed to get authentication token');
      }

      // Cache the new token
      this.token = newToken;
      // Set expiry to 11.5 hours from now (tokens expire in 12 hours)
      this.tokenExpiry = Date.now() + (11.5 * 60 * 60 * 1000);
      
      this.processQueue(null, newToken);
      return newToken;
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.processQueue(error, null);
      this.clearToken();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Clear cached token (useful for logout)
  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
  }

  // Get current token without refresh (for checking auth state)
  getCurrentToken() {
    return this.isTokenValid() ? this.token : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.isTokenValid();
  }
}

// Create a singleton instance
const authManager = new AuthManager();

export default authManager;
