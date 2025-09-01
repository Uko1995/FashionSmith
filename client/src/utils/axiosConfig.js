import axios from "axios";
import { refreshAccessToken } from "../services/tokenService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create main axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
    console.log(
      "[AXIOS INTERCEPTOR] Error received:",
      error.response?.status,
      error.response?.data
    );

    // Skip token refresh for Google OAuth users (they use JWT tokens)
    const isGoogleOAuth =
      originalRequest.headers?.Authorization?.startsWith("Bearer ");
    if (isGoogleOAuth) {
      console.log(
        "[AXIOS INTERCEPTOR] Google OAuth user detected, skipping token refresh"
      );
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        console.log(
          "[AXIOS INTERCEPTOR] Refresh in progress, queuing request."
        );
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
        console.log("[AXIOS INTERCEPTOR] Attempting token refresh...");
        const refreshResult = await refreshAccessToken();
        console.log("[AXIOS INTERCEPTOR] Refresh result:", refreshResult);

        if (refreshResult.success) {
          console.log(
            "[AXIOS INTERCEPTOR] Token refresh successful, retrying original request"
          );
          processQueue(null);
          return apiClient(originalRequest);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshError) {
        console.error(
          "[AXIOS INTERCEPTOR] Token refresh failed:",
          refreshError
        );
        processQueue(refreshError);

        // Force logout on refresh failure
        console.log("[AXIOS INTERCEPTOR] Triggering forced logout");
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
      console.log("[AXIOS INTERCEPTOR] Refresh token invalid, forcing logout");
      window.dispatchEvent(new CustomEvent("auth:forceLogout"));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
