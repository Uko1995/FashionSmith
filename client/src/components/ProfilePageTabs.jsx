/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  PackageIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  BellIcon,
  CreditCardIcon,
  TruckIcon,
  EyeIcon,
  TrashIcon,
  XIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import {
  dashboardAPI,
  notificationAPI,
  userAPI,
  productAPI,
} from "../services/api";

export default function ProfilePageTabs({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Utility function to get badge class based on order status
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "badge-warning";
      case "processing":
        return "badge-info";
      case "shipped":
        return "badge-primary";
      case "delivered":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      case "refunded":
        return "badge-neutral";
      default:
        return "badge-ghost";
    }
  };
  const [showFullOrder, setShowFullOrder] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showFullPayment, setShowFullPayment] = useState(false);

  // View full payment details function
  const viewFullPayment = (payment) => {
    setSelectedPayment(payment);
    setShowFullPayment(true);
    console.log("Viewing full payment details:", payment);
  };

  // Fetch dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: dashboardAPI.getOverview,
  });

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["userOrders"],
    queryFn: () => dashboardAPI.getUserOrders({ limit: 10 }),
    select: (response) => response?.data || [],
  });

  // Fetch payment history
  const { data: paymentHistoryData, isLoading: paymentHistoryLoading } =
    useQuery({
      queryKey: ["paymentHistory"],
      queryFn: () => dashboardAPI.getPaymentHistory({ limit: 20 }),
      select: (response) => response?.data || [],
    });

  // Fetch notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery(
    {
      queryKey: ["notifications"],
      queryFn: () => notificationAPI.getNotifications({ limit: 10 }),
      select: (response) => response?.data || {},
    }
  );

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast.success("Marked as read");
    },
    onError: () => {
      toast.error("Failed to mark as read");
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationAPI.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast.success("Notification deleted");
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId) => userAPI.deleteOrder(orderId),
    onSuccess: () => {
      toast.success("Order cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      setShowOrderModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    },
  });

  // Extract data with proper structure matching backend
  const stats = dashboardData?.data?.data?.statistics || {};
  const orders = ordersData?.data || [];
  const notifications = notificationsData?.data?.notifications || [];
  const unreadCount = notificationsData?.data?.unreadCount || 0;
  const paymentHistory = paymentHistoryData?.data || [];

  // Recent orders for dashboard preview (first 3)
  const recentOrders = orders.slice(0, 3);

  // Debug logging for data structure
  console.log("Dashboard Data Structure:", {
    dashboardData: dashboardData?.data,
    ordersData,
    paymentHistoryData,
    stats,
    orders: orders.length,
    paymentHistory: paymentHistory.length,
  });

  const viewFullOrder = (order = []) => {
    setSelectedOrder(order);
    setShowFullOrder(true);
    console.log("The user has clicked the button to view full order: ", order);
  };

  const statsCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders || 0,
      icon: PackageIcon,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders || 0,
      icon: ClockIcon,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders || 0,
      icon: CheckCircleIcon,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Spent",
      value: `₦${(stats.totalSpent || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  const getPaymentStatusBadgeClass = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "completed":
      case "success":
      case "successful":
        return "badge-success";
      case "pending":
      case "processing":
        return "badge-warning";
      case "failed":
      case "error":
        return "badge-error";
      case "refunded":
        return "badge-info";
      case "cancelled":
        return "badge-neutral";
      default:
        return "badge-neutral";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return PackageIcon;
      case "payment":
        return CreditCardIcon;
      case "delivery":
        return TruckIcon;
      default:
        return BellIcon;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="card bg-base-100 shadow-xl border border-base-300/50"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon size={24} className={stat.color} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Preview */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title mb-4">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <PackageIcon
                  size={48}
                  className="mx-auto text-base-content/30 mb-4"
                />
                <p className="text-base-content/60 mb-4">No orders yet</p>
                <button
                  onClick={() => navigate("/gallery")}
                  className="btn btn-primary btn-sm"
                >
                  Create First Order
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 3).map((order, index) => (
                  <div
                    key={order.id || index}
                    className="flex items-center justify-between p-3 rounded-lg border border-base-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary/10 text-primary rounded-lg w-10 h-10">
                          <PackageIcon size={20} />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {order.garment || "Custom Garment"}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`badge badge-sm ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status || "Pending"}
                      </div>
                      <p className="text-xs text-base-content/60 mt-1">
                        ₦{(order.cost || order.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => onTabChange("orders")}
                  className="btn btn-outline btn-sm w-full mt-4"
                >
                  View All Orders
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notifications Preview */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title">Notifications</h3>
              {unreadCount > 0 && (
                <span className="badge badge-error badge-sm">
                  {unreadCount}
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon
                  size={48}
                  className="mx-auto text-base-content/30 mb-4"
                />
                <p className="text-base-content/60">No notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id || index}
                      className={`p-3 rounded-lg border ${
                        notification.isRead
                          ? "border-base-300"
                          : "border-primary/30 bg-primary/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-lg w-8 h-8">
                            <Icon size={16} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-base-content/60 truncate">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => onTabChange("notifications")}
                  className="btn btn-outline btn-sm w-full mt-4"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-6">
          <h3 className="card-title">My Orders</h3>
          <button
            onClick={() => navigate("/gallery")}
            className="btn btn-primary btn-sm"
          >
            <PackageIcon size={16} className="mr-1" />
            New Order
          </button>
        </div>

        {ordersLoading ? (
          <div className="text-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="text-base-content/60 mt-2">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <PackageIcon
              size={64}
              className="mx-auto text-base-content/30 mb-4"
            />
            <h4 className="text-lg font-semibold mb-2">No orders yet</h4>
            <p className="text-base-content/60 mb-6">
              Start your custom tailoring journey today
            </p>
            <button
              onClick={() => navigate("/gallery")}
              className="btn btn-primary"
            >
              Create Your First Order
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const isExpanded = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id || index}
                  className="border border-base-300 rounded-lg p-4 hover:bg-base-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {!isExpanded ? (
                      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-semibold">
                              {order.garment || "Custom Garment"}
                            </h4>
                            <p className="text-sm text-base-content/80">
                              Order #{order.id} •{" "}
                              {order.orderDate
                                ? new Date(order.orderDate).toLocaleDateString()
                                : "Recently"}
                            </p>
                            <p className="text-sm font-medium">
                              ₦
                              {(
                                order.cost ||
                                order.price ||
                                0
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className={`badge badge-lg badge-soft ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </div>
                          <div className="dropdown dropdown-end">
                            <div
                              tabIndex={0}
                              role="button"
                              className="btn btn-ghost btn-sm"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 5v.01M12 12v.01M12 19v.01"
                                />
                              </svg>
                            </div>
                            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                              <li>
                                <button
                                  className="flex items-center gap-2 btn btn-ghost"
                                  onClick={() => viewFullOrder(order)}
                                >
                                  <EyeIcon size={16} />
                                  View Details
                                </button>
                              </li>
                              {order.status === "Pending" && (
                                <li>
                                  <button
                                    onClick={() =>
                                      cancelOrderMutation.mutate(order.id)
                                    }
                                    className="text-error"
                                  >
                                    <TrashIcon size={16} />
                                    Cancel Order
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Enhanced Order Details View
                      <div className="w-full">
                        {/* Header with title and close button */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="text-xl font-bold text-base-content">
                                Order Details
                              </h3>
                              <p className="text-sm text-base-content/70">
                                #{selectedOrder.id || "N/A"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrder(null);
                              setShowFullOrder(false);
                            }}
                            className="btn btn-ghost btn-circle btn-sm hover:bg-error/10 hover:text-error"
                          >
                            <XIcon size={20} />
                          </button>
                        </div>

                        {/* Order Status Banner */}
                        <div
                          className={`alert mb-6 ${
                            selectedOrder.status?.toLowerCase() === "delivered"
                              ? "alert-success"
                              : selectedOrder.status?.toLowerCase() ===
                                "shipped"
                              ? "alert-info"
                              : selectedOrder.status?.toLowerCase() ===
                                "processing"
                              ? "alert-warning"
                              : selectedOrder.status?.toLowerCase() ===
                                "cancelled"
                              ? "alert-error"
                              : "alert-warning"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {selectedOrder.status?.toLowerCase() ===
                            "delivered" ? (
                              <CheckCircleIcon size={24} />
                            ) : selectedOrder.status?.toLowerCase() ===
                              "shipped" ? (
                              <TruckIcon size={24} />
                            ) : selectedOrder.status?.toLowerCase() ===
                              "processing" ? (
                              <ClockIcon size={24} />
                            ) : (
                              <ClockIcon size={24} />
                            )}
                            <div>
                              <h4 className="font-semibold">
                                Status: {selectedOrder.status || "Pending"}
                              </h4>
                              <p className="text-sm opacity-80">
                                {selectedOrder.status?.toLowerCase() ===
                                "delivered"
                                  ? "Your order has been delivered successfully!"
                                  : selectedOrder.status?.toLowerCase() ===
                                    "shipped"
                                  ? "Your order is on its way!"
                                  : selectedOrder.status?.toLowerCase() ===
                                    "processing"
                                  ? "Your order is being prepared."
                                  : "Your order is awaiting confirmation."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Main Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Product Information Card */}
                          <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                              <h4 className="card-title text-lg flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                Product Information
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Garment:
                                  </span>
                                  <span className="font-semibold">
                                    {selectedOrder.garment || "Custom Garment"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Color:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {selectedOrder.color && (
                                      <div
                                        className="w-4 h-4 rounded-full border border-base-300"
                                        style={{
                                          backgroundColor:
                                            selectedOrder.color?.toLowerCase() ||
                                            "#gray",
                                        }}
                                      ></div>
                                    )}
                                    <span className="capitalize">
                                      {selectedOrder.color || "Not specified"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Fabric:
                                  </span>
                                  <span className="capitalize">
                                    {selectedOrder.fabric || "Standard"}
                                  </span>
                                </div>
                                {selectedOrder.sleeveType && (
                                  <div className="flex justify-between items-center py-2 border-b border-base-200">
                                    <span className="text-base-content/70 font-medium">
                                      Sleeve Type:
                                    </span>
                                    <span className="capitalize">
                                      {selectedOrder.sleeveType ===
                                      "shortSleeve"
                                        ? "Short Sleeve"
                                        : selectedOrder.sleeveType ===
                                          "longSleeve"
                                        ? "Long Sleeve"
                                        : selectedOrder.sleeveType}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between items-center py-2">
                                  <span className="text-base-content/70 font-medium">
                                    Quantity:
                                  </span>
                                  <div className="badge badge-outline badge-lg">
                                    {selectedOrder.quantity || 1}{" "}
                                    {(selectedOrder.quantity || 1) > 1
                                      ? "pieces"
                                      : "piece"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Information Card */}
                          <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                              <h4 className="card-title text-lg flex items-center gap-2">
                                <div className="w-2 h-2 bg-accent rounded-full"></div>
                                Order Information
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Total Cost:
                                  </span>
                                  <span className="text-xl font-bold text-primary">
                                    ₦
                                    {(
                                      selectedOrder.cost ||
                                      selectedOrder.price ||
                                      0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Order Date:
                                  </span>
                                  <span>
                                    {selectedOrder.orderDate
                                      ? new Date(
                                          selectedOrder.orderDate
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Expected Delivery:
                                  </span>
                                  <span className="text-accent font-medium">
                                    {selectedOrder.deliveryDate
                                      ? new Date(
                                          selectedOrder.deliveryDate
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })
                                      : "TBD"}
                                  </span>
                                </div>
                                <div className="py-2">
                                  <span className="text-base-content/70 font-medium block mb-2">
                                    Delivery Address:
                                  </span>
                                  <div className="bg-base-200 p-3 rounded-lg">
                                    <p className="text-sm leading-relaxed">
                                      {selectedOrder.deliveryAddress ||
                                        "Address will be confirmed"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-base-300">
                          {selectedOrder.status?.toLowerCase() ===
                            "pending" && (
                            <button
                              onClick={() => navigate("/dashboard/payments")}
                              className="btn btn-primary gap-2"
                            >
                              <CurrencyDollarIcon size={20} />
                              Complete Payment
                            </button>
                          )}
                          <button
                            onClick={() => navigate("/contact")}
                            className="btn btn-outline gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                              />
                            </svg>
                            Contact Support
                          </button>
                          {(selectedOrder.status?.toLowerCase() ===
                            "delivered" ||
                            selectedOrder.status?.toLowerCase() ===
                              "shipped") && (
                            <button className="btn btn-accent gap-2">
                              <CheckCircleIcon size={20} />
                              Leave Review
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // Add track order functionality
                              toast.info("Order tracking feature coming soon!");
                            }}
                            className="btn btn-outline gap-2"
                          >
                            <TruckIcon size={20} />
                            Track Order
                          </button>
                          {selectedOrder.status?.toLowerCase() ===
                            "pending" && (
                            <button
                              onClick={() =>
                                cancelOrderMutation.mutate(selectedOrder.id)
                              }
                              className="btn btn-error btn-outline gap-2"
                            >
                              <TrashIcon size={20} />
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-6">
          <h3 className="card-title">Notifications</h3>
          {unreadCount > 0 && (
            <span className="badge badge-error">{unreadCount} unread</span>
          )}
        </div>

        {notificationsLoading ? (
          <div className="text-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon size={64} className="mx-auto text-base-content/30 mb-4" />
            <h4 className="text-lg font-semibold mb-2">No notifications</h4>
            <p className="text-base-content/60">
              You're all caught up! Notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id || index}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.isRead
                      ? "border-base-300 bg-base-50"
                      : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="avatar placeholder">
                      <div className="bg-primary/10 text-primary rounded-lg w-10 h-10">
                        <Icon size={20} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-base-content/70 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-base-content/50">
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString()
                          : "Recently"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() =>
                            markAsReadMutation.mutate(notification.id)
                          }
                          className="btn btn-ghost btn-sm"
                          title="Mark as read"
                        >
                          <CheckIcon size={16} />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          deleteNotificationMutation.mutate(notification.id)
                        }
                        className="btn btn-ghost btn-sm text-error"
                        title="Delete"
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl border border-base-300/50">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-success">
                  ₦{(stats.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircleIcon size={24} className="text-success" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-300/50">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">
                  Pending Payments
                </p>
                <p className="text-2xl font-bold text-warning">
                  {stats.pendingOrders || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <ClockIcon size={24} className="text-warning" />
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-300/50">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60 mb-1">
                  Payment Methods
                </p>
                <p className="text-2xl font-bold text-info">2</p>
              </div>
              <div className="p-3 rounded-full bg-info/10 flex items-center justify-center">
                <CreditCardIcon size={24} className="text-info" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      {orders.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title mb-4 text-warning">
              <ClockIcon size={24} className="mr-2" />
              Pending Payments
            </h3>
            <div className="space-y-3">
              {orders
                .filter(
                  (order) =>
                    order.paymentStatus === "Pending" ||
                    (!order.paymentStatus && order.status === "Pending")
                )
                .map((order, index) => (
                  <div
                    key={order.id || index}
                    className="p-4 border border-warning/30 bg-warning/5 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="avatar placeholder">
                          <div className="bg-warning/10 text-warning rounded-lg w-12 h-12">
                            <PackageIcon size={20} />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {order.garment || "Custom Garment"}
                          </h4>
                          <p className="text-sm text-base-content/60">
                            Order #{order.id} •{" "}
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString()
                              : "Recently"}
                          </p>
                          <p className="text-sm font-medium">
                            ₦{(order.cost || order.price || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/dashboard/payments")}
                        className="btn btn-warning btn-sm"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title mb-4">
            <CreditCardIcon size={24} className="mr-2" />
            Payment History
          </h3>

          {paymentHistoryLoading ? (
            <div className="text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-12">
              <CreditCardIcon
                size={64}
                className="mx-auto text-base-content/30 mb-4"
              />
              <h4 className="text-lg font-semibold mb-2">No payment history</h4>
              <p className="text-base-content/60 mb-6">
                Your completed payments will appear here
              </p>
              <button
                onClick={() => navigate("/gallery")}
                className="btn btn-primary"
              >
                Make Your First Order
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory.map((payment, index) => (
                <div
                  key={payment.id || index}
                  className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="card-body p-4">
                    {!showFullPayment || selectedPayment?.id !== payment.id ? (
                      // Minimal Payment Details View
                      <>
                        <div className="flex flex-col md:flex-row items-center sm:justify-start justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <h4 className="font-semibold text-base">
                                {payment.description ||
                                  `Payment for Order #${payment.orderId}`}
                              </h4>
                              <p className="text-sm text-base-content/60">
                                {payment.createdAt
                                  ? new Date(
                                      payment.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "Date not available"}
                                {payment.paymentMethod &&
                                  ` • ${payment.paymentMethod}`}
                              </p>
                              <p className="text-lg font-bold text-primary mt-1">
                                ₦
                                {((payment.amount || 0) / 100).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex sm:justify-between items-center gap-10 mt-4 md:mt-0">
                            <div
                              className={`badge badge-lg ${getPaymentStatusBadgeClass(
                                payment.status
                              )}`}
                            >
                              {payment.status || "Unknown"}
                            </div>
                            <div className="dropdown dropdown-end">
                              <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  className="w-5 h-5 stroke-current"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01"
                                  />
                                </svg>
                              </div>
                              <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                <li>
                                  <button
                                    className="flex items-center gap-2 btn btn-ghost"
                                    onClick={() => viewFullPayment(payment)}
                                  >
                                    <EyeIcon size={16} />
                                    View Details
                                  </button>
                                </li>
                                {payment.transactionId && (
                                  <li>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          payment.transactionId
                                        );
                                        toast.success("Transaction ID copied!");
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.031.754-.031 1.127 0C12.484 4.01 13.25 4.973 13.25 6.108V7.5M15.75 18H2.25A2.25 2.25 0 010 15.75V9a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0118 9v6.75A2.25 2.25 0 0115.75 18z"
                                        />
                                      </svg>
                                      Copy Transaction ID
                                    </button>
                                  </li>
                                )}
                                {payment.status === "Failed" && (
                                  <li>
                                    <button className="text-warning flex items-center gap-2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                        />
                                      </svg>
                                      Retry Payment
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Enhanced Payment Details View
                      <div className="w-full">
                        {/* Header with title and close button */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                                <CreditCardIcon size={24} />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-base-content">
                                Payment Details
                              </h3>
                              <p className="text-sm text-base-content/70">
                                Transaction #
                                {selectedPayment.transactionId ||
                                  selectedPayment.id ||
                                  "N/A"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPayment(null);
                              setShowFullPayment(false);
                            }}
                            className="btn btn-ghost btn-circle btn-sm hover:bg-error/10 hover:text-error"
                          >
                            <XIcon size={20} />
                          </button>
                        </div>

                        {/* Payment Status Banner */}
                        <div
                          className={`alert mb-6 ${
                            selectedPayment.status === "Completed" ||
                            selectedPayment.status === "Successful"
                              ? "alert-success"
                              : selectedPayment.status === "Failed"
                              ? "alert-error"
                              : selectedPayment.status === "Pending"
                              ? "alert-warning"
                              : "alert-info"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {selectedPayment.status === "Completed" ||
                            selectedPayment.status === "Successful" ? (
                              <CheckCircleIcon size={24} />
                            ) : selectedPayment.status === "Failed" ? (
                              <XIcon size={24} />
                            ) : (
                              <ClockIcon size={24} />
                            )}
                            <div>
                              <h4 className="font-semibold">
                                Payment Status:{" "}
                                {selectedPayment.status || "Unknown"}
                              </h4>
                              <p className="text-sm opacity-80">
                                {selectedPayment.status === "Completed" ||
                                selectedPayment.status === "Successful"
                                  ? "Payment processed successfully!"
                                  : selectedPayment.status === "Failed"
                                  ? "Payment failed. Please try again."
                                  : selectedPayment.status === "Pending"
                                  ? "Payment is being processed."
                                  : "Payment status is being verified."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Main Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Transaction Information Card */}
                          <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                              <h4 className="card-title text-lg flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                Transaction Details
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Amount:
                                  </span>
                                  <span className="text-xl font-bold text-primary">
                                    ₦
                                    {(
                                      selectedPayment.amount / 100 || 0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Payment Method:
                                  </span>
                                  <span className="capitalize">
                                    {selectedPayment.paymentMethod ||
                                      "Not specified"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Gateway:
                                  </span>
                                  <span className="capitalize">
                                    {selectedPayment.gateway || "Paystack"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                  <span className="text-base-content/70 font-medium">
                                    Reference:
                                  </span>
                                  <span className="font-mono text-sm">
                                    {selectedPayment.reference || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Information Card */}
                          <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                              <h4 className="card-title text-lg flex items-center gap-2">
                                <div className="w-2 h-2 bg-accent rounded-full"></div>
                                Order Information
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Order ID:
                                  </span>
                                  <span className="font-mono">
                                    #{selectedPayment.orderId || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Payment Date:
                                  </span>
                                  <span>
                                    {selectedPayment.createdAt
                                      ? new Date(
                                          selectedPayment.createdAt
                                        ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                  <span className="text-base-content/70 font-medium">
                                    Transaction ID:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">
                                      {selectedPayment.transactionId || "N/A"}
                                    </span>
                                    {selectedPayment.transactionId && (
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(
                                            selectedPayment.transactionId
                                          );
                                          toast.success(
                                            "Transaction ID copied!"
                                          );
                                        }}
                                        className="btn btn-ghost btn-xs"
                                      >
                                        Copy
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {selectedPayment.refundAmount && (
                                  <div className="py-2">
                                    <span className="text-base-content/70 font-medium block mb-2">
                                      Refund Information:
                                    </span>
                                    <div className="bg-info/10 p-3 rounded-lg">
                                      <p className="text-sm text-info font-medium">
                                        Refunded: ₦
                                        {selectedPayment.refundAmount.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-base-300">
                          {selectedPayment.status === "Failed" && (
                            <button className="btn btn-warning gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                              </svg>
                              Retry Payment
                            </button>
                          )}
                          {(selectedPayment.status === "Completed" ||
                            selectedPayment.status === "Successful") && (
                            <button
                              onClick={() => {
                                // Add download receipt functionality
                                toast.info(
                                  "Receipt download feature coming soon!"
                                );
                              }}
                              className="btn btn-primary gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                />
                              </svg>
                              Download Receipt
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // Add support functionality
                              toast.info("Redirecting to support...");
                              navigate("/contacts");
                            }}
                            className="btn btn-outline gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                              />
                            </svg>
                            Contact Support
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Saved Payment Methods */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title mb-4">
            <CreditCardIcon size={24} className="mr-2" />
            Saved Payment Methods
          </h3>

          <div className="space-y-3">
            {/* Sample payment methods - replace with actual data */}
            <div className="p-4 border border-base-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary/10 text-primary rounded-lg w-10 h-10 flex items-center justify-center">
                      <CreditCardIcon size={20} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">•••• •••• •••• 4242</h4>
                    <p className="text-sm text-base-content/60">
                      Expires 12/26
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm">Edit</button>
                  <button className="btn btn-ghost btn-sm text-error">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border border-base-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-success/10 text-success rounded-lg w-10 h-10 flex items-center justify-center">
                      <CreditCardIcon size={20} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Paystack Wallet</h4>
                    <p className="text-sm text-base-content/60">
                      Default payment method
                    </p>
                  </div>
                </div>
                <div className="badge badge-success">Active</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-base-300">
            <button className="btn btn-outline btn-sm">
              <CreditCardIcon size={16} className="mr-2" />
              Add New Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render content based on active tab
  switch (activeTab) {
    case "overview":
      return renderOverviewTab();
    case "orders":
      return renderOrdersTab();
    case "notifications":
      return renderNotificationsTab();
    case "payments":
      return renderPaymentsTab();
    default:
      return renderOverviewTab();
  }
}
