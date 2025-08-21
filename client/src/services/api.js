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
  updateMeasurement: (data) =>
    apiClient.patch("/api/users/updateMeasurement", data),
  deleteMeasurement: () => apiClient.delete("/api/users/removeMeasurement"),
  // Order management
  createOrder: (data) => apiClient.post("/api/users/newOrder", data),
  getOrders: () => apiClient.get("/api/users/getOrder"),
  updateOrder: (data) => apiClient.patch("/api/users/updateOrder", data),
  deleteOrder: (orderId) =>
    apiClient.delete(`/api/users/removeOrder/${orderId}`),
  // Payment management (Paystack)
  initializePayment: (data) => apiClient.post("/api/payments/initialize", data),
  verifyPayment: (reference) =>
    apiClient.get(`/api/payments/verify/${reference}`),
  getPaymentHistory: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiClient.get(
      `/api/payments/history${queryString ? `?${queryString}` : ""}`
    );
  },
};

// Notification API calls
export const notificationAPI = {
  // Get user notifications with pagination and filters
  getNotifications: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiClient.get(
      `/api/notifications${queryString ? `?${queryString}` : ""}`
    );
  },

  // Get unread notification count
  getUnreadCount: () => apiClient.get("/api/notifications/unread-count"),

  // Mark single notification as read
  markAsRead: (notificationId) =>
    apiClient.patch(`/api/notifications/${notificationId}/read`),

  // Mark all notifications as read
  markAllAsRead: () => apiClient.patch("/api/notifications/mark-all-read"),

  // Delete single notification
  deleteNotification: (notificationId) =>
    apiClient.delete(`/api/notifications/${notificationId}`),

  // Bulk operations (markAsRead, delete)
  bulkAction: (action, notificationIds) =>
    apiClient.post("/api/notifications/bulk", { action, notificationIds }),
};

// Order API calls (legacy - keeping for compatibility)
export const orderAPI = {
  createOrder: (data) => apiClient.post("/api/users/newOrder", data),
  getOrders: () => apiClient.get("/api/users/getOrder"),
  updateOrder: (data) => apiClient.patch("/api/users/updateOrder", data),
  deleteOrder: (orderId) =>
    apiClient.delete(`/api/users/removeOrder/${orderId}`),
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
  getUserOrders: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiClient.get(
      `/api/dashboard/orders${queryString ? `?${queryString}` : ""}`
    );
  },
};

// Payment API calls (Paystack integration)
export const paymentAPI = {
  // Initialize payment with Paystack
  initializePayment: (data) => apiClient.post("/api/payments/initialize", data),

  // Verify payment after user completes payment
  verifyPayment: (reference) =>
    apiClient.get(`/api/payments/verify/${reference}`),

  // Get payment history with pagination and filters
  getPaymentHistory: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiClient.get(
      `/api/payments/history${queryString ? `?${queryString}` : ""}`
    );
  },

  // Get specific payment details
  getPaymentDetails: (paymentId) => apiClient.get(`/api/payments/${paymentId}`),

  // Legacy endpoints for backward compatibility
  processPayment: (data) => apiClient.post("/api/payments/initialize", data),
  getPaymentStatus: (paymentId) => apiClient.get(`/api/payments/${paymentId}`),
};

// Admin API calls
export const adminAPI = {
  // Dashboard stats
  getDashboardStats: () => apiClient.get("/api/admin/stats"),

  // User management
  getUsers: () => apiClient.get("/api/admin/users"),
  getUserDetails: (userId) => apiClient.get(`/api/admin/users/${userId}`),

  // Order management
  getAllOrders: () => apiClient.get("/api/admin/orders"),

  // Product management
  getProducts: () => apiClient.get("/api/admin/products"),
  createProduct: (data) => apiClient.post("/api/admin/products", data),
  updateProduct: (productId, data) => apiClient.put(`/api/products/${productId}`, data),
  deleteProduct: (productId) => apiClient.delete(`/api/products/${productId}`),
  uploadProductImages: (productId, formData) => {
    return apiClient.post(`/api/products/${productId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadFlexibleImages: (productId, formData) => {
    return apiClient.post(
      `/api/products/${productId}/upload-images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  deleteProductImage: (productId, imagePublicId) =>
    apiClient.delete(`/api/products/${productId}/images/${imagePublicId}`),
  setMainImage: (productId, imagePublicId) =>
    apiClient.patch(`/api/products/${productId}/images/${imagePublicId}/main`),
};

export default apiClient;
