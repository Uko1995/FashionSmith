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
    console.log("[AXIOS INTERCEPTOR] Error received:", error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        console.log(
          "[AXIOS INTERCEPTOR] Refresh in progress, queuing request."
        );
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            console.log(
              "[AXIOS INTERCEPTOR] Retrying original request after refresh."
            );
            return apiClient(originalRequest);
          })
          .catch((err) => {
            console.log("[AXIOS INTERCEPTOR] Error after refresh:", err);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log("[AXIOS INTERCEPTOR] Starting token refresh...");

      try {
        const refreshResult = await refreshAccessToken();
        console.log("[AXIOS INTERCEPTOR] Refresh result:", refreshResult);

        if (refreshResult.success) {
          processQueue(null);
          console.log(
            "[AXIOS INTERCEPTOR] Token refreshed, retrying original request."
          );
          return apiClient(originalRequest);
        } else {
          // Refresh failed, trigger logout
          processQueue(error, null);
          console.log(
            "[AXIOS INTERCEPTOR] Refresh failed, dispatching logout."
          );
          window.dispatchEvent(new CustomEvent("auth:logout"));
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.log(
          "[AXIOS INTERCEPTOR] Exception during refresh:",
          refreshError
        );
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        console.log("[AXIOS INTERCEPTOR] isRefreshing set to false.");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
