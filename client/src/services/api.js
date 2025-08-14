import apiClient from "../utils/axiosConfig";

// Auth API calls
export const authAPI = {
  login: (credentials) => apiClient.post("/api/users/login", credentials),
  logout: () => apiClient.post("/api/users/logout", {}),
  signup: (userData) => apiClient.post("/api/users/signup", userData),
  refresh: () => apiClient.post("/api/users/refresh"),
  resendVerification: (email) =>
    apiClient.post("/api/users/resend-verification", { email }),
};

// User API calls
export const userAPI = {
  getProfile: () => apiClient.get("/api/users/profile"),
  updateProfile: (data) => apiClient.patch("/api/users/updateProfile", data),
  changePassword: (data) => apiClient.patch("/api/users/changePassword", data),
  deleteProfile: () => apiClient.delete("/api/users/profile"),
  getMeasurements: () => apiClient.get("/api/users/getMeasurement"),
  addMeasurement: (data) => apiClient.post("/api/users/addMeasurement", data),
  updateMeasurement: (data) => apiClient.patch("/api/users/updateMeasurement", data),
  deleteMeasurement: () => apiClient.delete("/api/users/removeMeasurement"),
};

// Order API calls
export const orderAPI = {
  createOrder: (data) => apiClient.post("/api/orders", data),
  getOrders: () => apiClient.get("/api/orders"),
  updateOrder: (data) => apiClient.put("/api/orders", data),
  deleteOrder: (orderId) => apiClient.delete(`/api/orders/${orderId}`),
};

// Product API calls
export const productAPI = {
  getProducts: () => apiClient.get("/api/products"),
  getProduct: (id) => apiClient.get(`/api/products/${id}`),
};

// Dashboard API calls
export const dashboardAPI = {
  getDashboard: () => apiClient.get("/api/dashboard"),
  getOverview: () => apiClient.get("/api/dashboard"),
  getUserOrders: (params) => apiClient.get("/api/dashboard/orders", { params }),
};

export default apiClient;
