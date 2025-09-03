import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance for refresh requests
const refreshAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const refreshAccessToken = async () => {
  try {
    const response = await refreshAPI.post("/api/users/refresh");

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Token refresh failed",
    };
  }
};
