import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  PackageIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  PlusIcon,
  RulerIcon,
  ClockCounterClockwiseIcon,
  GearIcon,
  CalendarCheckIcon,
  StarIcon,
  BellIcon,
  XIcon,
  CheckIcon,
  WarningIcon,
  TruckIcon,
  MoneyIcon,
  UserIcon,
  SparkleIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react";

import SVGFallBack from "../components/SVGFallBack";
import { dashboardAPI, notificationAPI } from "../services/api";

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch dashboard data using react-query
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: dashboardAPI.getOverview,
  });

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationAPI.getNotifications({ limit: 10 }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  if (isLoading || notificationsLoading) {
    return <SVGFallBack />;
  }

  if (error || notificationsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <div className="text-error text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
        <p className="text-base-content/60 mb-4">
          {error?.response?.data?.message ||
            notificationsError?.response?.data?.message ||
            "Something went wrong"}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = dashboardData?.data?.data?.statistics || {};
  const user = dashboardData?.data?.data?.user || {};
  const recentOrders = dashboardData?.data?.data?.recentOrders || [];
  const quickActions = dashboardData?.data?.data?.quickActions || [];
  const recommendations = dashboardData?.data?.data?.recommendations || [];

  // Extract notifications from API response
  const notifications = notificationsData?.data?.data?.notifications || [];
  const unreadCount = notificationsData?.data?.data?.unreadCount || 0;

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "badge-warning";
      case "in progress":
        return "badge-info";
      case "ready":
        return "badge-success";
      case "delivered":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return TruckIcon;
      case "payment":
        return MoneyIcon;
      case "delivery":
        return PackageIcon;
      case "measurement":
        return UserIcon;
      case "promotion":
        return SparkleIcon;
      case "system":
        return GearIcon;
      default:
        return BellIcon;
    }
  };

  const markAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Helper function to format timestamp
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-primary-content">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {user.username || "User"}! 👋
            </h1>
            <p className="opacity-90">
              {user.isVerified ? (
                "Your account is verified and ready to go!"
              ) : (
                <span className="flex items-center gap-2">
                  <span>Please verify your email to unlock all features</span>
                  <button className="btn btn-sm btn-warning">Verify Now</button>
                </span>
              )}
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="stats shadow bg-base-100/10 backdrop-blur-sm">
              <div className="stat">
                <div className="stat-figure text-primary-content">
                  <CalendarCheckIcon size={32} />
                </div>
                <div className="stat-title text-primary-content/70">
                  Member Since
                </div>
                <div className="stat-value text-primary-content text-lg">
                  {user.memberSince
                    ? new Date(user.memberSince).getFullYear()
                    : "2024"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Icon - Top Right */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <button
            onClick={() => setShowNotificationsModal(true)}
            className="btn btn-circle btn-primary relative shadow-lg hover:shadow-xl transition-all duration-200"
            title="Notifications"
          >
            <BellIcon size={20} />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-error text-error-content rounded-full text-xs font-bold min-w-[20px] h-5 flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="card bg-base-100 shadow-sm border border-base-300"
            >
              <div className="card-body p-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const getActionIcon = (iconName) => {
                    switch (iconName) {
                      case "plus":
                        return PlusIcon;
                      case "ruler":
                        return RulerIcon;
                      case "history":
                        return ClockCounterClockwiseIcon;
                      case "settings":
                        return GearIcon;
                      default:
                        return PlusIcon;
                    }
                  };

                  const Icon = getActionIcon(action.icon);

                  return (
                    <button
                      key={index}
                      onClick={() => navigate(action.link)}
                      className="w-full p-3 text-left rounded-lg border border-base-300 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon size={16} className="text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-xs text-base-content/60 truncate">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-lg">Recent Orders</h3>
                <button
                  onClick={() => navigate("/dashboard/orders")}
                  className="btn btn-sm btn-ghost"
                >
                  View All
                </button>
              </div>

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
                    <PlusIcon size={16} />
                    Create First Order
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map((order, index) => (
                    <div
                      key={order.id || index}
                      className="flex items-center justify-between p-3 rounded-lg border border-base-300 hover:bg-base-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-lg w-10 h-10">
                            <PackageIcon size={20} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
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
                          className={`badge badge-sm ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status || "Pending"}
                        </div>
                        <p className="text-xs text-base-content/60 mt-1">
                          {(order.totalCost || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-lg flex items-center gap-2">
                <StarIcon size={20} className="text-warning" />
                Recommended for You
              </h3>
              <button
                onClick={() => navigate("/gallery")}
                className="btn btn-sm btn-ghost"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((product, index) => (
                <div
                  key={product.id || index}
                  className="card card-compact bg-base-100 border border-base-300 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <figure className="h-32 bg-base-200">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <PackageIcon
                          size={32}
                          className="text-base-content/30"
                        />
                      </div>
                    )}
                  </figure>
                  <div className="card-body p-3">
                    <h4 className="text-sm font-medium truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-base-content/60">
                      {product.category}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold">
                        {(product.price || 0).toLocaleString()}
                      </span>
                      <button className="btn btn-xs btn-primary">Order</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Side Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowNotificationsModal(false)}
          ></div>

          {/* Modal */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-base-100 shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-base-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BellIcon size={24} className="text-primary" />
                    <div>
                      <h2 className="text-lg font-semibold">Notifications</h2>
                      <p className="text-sm text-base-content/60">
                        {unreadCount} unread
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="btn btn-sm btn-ghost text-primary"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotificationsModal(false)}
                      className="btn btn-sm btn-circle btn-ghost"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <BellIcon size={48} className="text-base-content/30 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No notifications
                    </h3>
                    <p className="text-base-content/60">
                      You're all caught up! Check back later for updates.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);

                      return (
                        <div
                          key={notification.id}
                          className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                            !notification.read
                              ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                              : "border-base-300 bg-base-100 hover:bg-base-200"
                          }`}
                          onClick={() => markAsRead(notification._id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 p-2.5 rounded-full ${
                                notification.priority === "high"
                                  ? "bg-error/10 text-error"
                                  : notification.priority === "medium"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-info/10 text-info"
                              }`}
                            >
                              <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4
                                  className={`font-medium text-sm ${
                                    !notification.read
                                      ? "text-base-content"
                                      : "text-base-content/70"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-xs text-base-content/50">
                                    {formatTimestamp(notification.createdAt)}
                                  </span>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-base-content/70 leading-relaxed">
                                {notification.message}
                              </p>

                              {/* Priority badge */}
                              <div className="flex items-center justify-between mt-3">
                                <div
                                  className={`badge badge-sm ${
                                    notification.priority === "high"
                                      ? "badge-error"
                                      : notification.priority === "medium"
                                      ? "badge-warning"
                                      : "badge-info"
                                  }`}
                                >
                                  {notification.priority}
                                </div>

                                {/* Action buttons */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle action
                                    }}
                                    className="btn btn-xs btn-ghost"
                                  >
                                    <DotsThreeIcon size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-base-300">
                <button
                  onClick={() => {
                    setShowNotificationsModal(false);
                    navigate("/dashboard/notifications");
                  }}
                  className="btn btn-primary btn-block"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
