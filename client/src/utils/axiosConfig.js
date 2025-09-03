import axios from "axios";
import { refreshAccessToken } from "../services/tokenService";

// Get API URL from environment variables with production fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://fashionsmith.onrender.com' : 'http://localhost:3000');

// Validate API URL is set for production
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL environment variable is not set, using fallback URL');
}

// Create main axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15 second timeout to prevent hanging
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh for Google OAuth users (they use JWT tokens)
    const isGoogleOAuth =
      originalRequest.headers?.Authorization?.startsWith("Bearer ");
    if (isGoogleOAuth) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResult = await refreshAccessToken();

        if (refreshResult.success) {
          processQueue(null);
          return apiClient(originalRequest);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError);

        // Force logout on refresh failure
        window.dispatchEvent(new CustomEvent("auth:forceLogout"));

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 (forbidden) - usually means refresh token is invalid
    if (
      error.response?.status === 403 &&
      originalRequest.url?.includes("/refresh")
    ) {
      window.dispatchEvent(new CustomEvent("auth:forceLogout"));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
