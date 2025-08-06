import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create axios instance for refresh requests
const refreshAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const refreshAccessToken = async () => {
  try {
    console.log("[TOKEN SERVICE] Attempting to refresh access token...");
    console.log("[TOKEN SERVICE] API Base URL:", API_BASE_URL);
    console.log("[TOKEN SERVICE] Making request to:", `${API_BASE_URL}/api/users/refresh`);
    
    const response = await refreshAPI.post("/api/users/refresh");
    console.log("[TOKEN SERVICE] Refresh successful:", response.data);
    
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("[TOKEN SERVICE] Token refresh failed:", error);
    console.error("[TOKEN SERVICE] Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    return {
      success: false,
      error: error.response?.data?.message || "Token refresh failed",
    };
  }
};
