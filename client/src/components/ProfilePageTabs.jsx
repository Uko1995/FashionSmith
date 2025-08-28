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
  const [showFullOrder, setShowFullOrder] = useState(false);

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

  // Fetch notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery(
    {
      queryKey: ["notifications"],
      queryFn: () => notificationAPI.getNotifications({ limit: 10 }),
      refetchInterval: 30000,
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

  // Extract data
  const stats = dashboardData?.data?.data?.statistics || {};
  const orders = ordersData?.data || [];
  const notifications = notificationsData?.data?.data?.notifications || [];
  const unreadCount = notificationsData?.data?.data?.unreadCount || 0;

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "badge-warning";
      case "In Progress":
      case "Ready":
        return "badge-success";
      case "Paid":
        return "btn-success";
      case "Failed":
        return "btn-error";
      case "Refunded":
        return "btn-secondary";
      case "Delivered":
        return "badge-success";
      case "Cancelled":
        return "badge-error";
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
                        ₦{(order.totalCost || 0).toLocaleString()}
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
                      <>
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-semibold">
                              {order.garment || "Custom Garment"}
                            </h4>
                            <p className="text-sm text-base-content/80">
                              Order #{order.id} •{"   "}
                              {order.orderDate
                                ? new Date(order.orderDate).toLocaleDateString()
                                : "Recently"}
                            </p>
                            <p className="text-sm font-medium">
                              ₦{(order.cost || 0).toLocaleString()}
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
                      </>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">
                            {selectedOrder.garment || "Custom Garment"} - Full
                            Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p>
                                <strong>Order ID:</strong> {selectedOrder.id}
                              </p>
                              <p>
                                <strong>Garment:</strong>{" "}
                                {selectedOrder.garment}
                              </p>
                              <p>
                                <strong>Color:</strong> {selectedOrder.color}
                              </p>
                              <p>
                                <strong>Fabric:</strong> {selectedOrder.fabric}
                              </p>
                              <p>
                                <strong>Quantity:</strong>{" "}
                                {selectedOrder.quantity}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Cost:</strong> ₦
                                {(selectedOrder.cost || 0).toLocaleString()}
                              </p>
                              <p>
                                <strong>Status:</strong> {selectedOrder.status}
                              </p>
                              <p>
                                <strong>Order Date:</strong>{" "}
                                {selectedOrder.orderDate
                                  ? new Date(
                                      selectedOrder.orderDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                              <p>
                                <strong>Delivery Date:</strong>{" "}
                                {selectedOrder.deliveryDate
                                  ? new Date(
                                      selectedOrder.deliveryDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                              <p>
                                <strong>Delivery Address:</strong>{" "}
                                {selectedOrder.deliveryAddress}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrder(null);
                            setShowFullOrder(false);
                          }}
                          className="btn btn-ghost btn-sm ml-4"
                        >
                          <XIcon size={20} />
                        </button>
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
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title mb-6">Payment Management</h3>

        {ordersLoading ? (
          <div className="text-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Payments */}
            {orders.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4 text-primary">
                  Payments ({orders.length})
                </h4>
                <div className="space-y-3">
                  {orders.map((order, index) => (
                    <div
                      key={order.id || index}
                      className="p-4 border border-warning/30 bg-warning/5 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-lg">
                            {order.garment || "Custom Garment"}
                          </h5>
                          <p className="text-sm text-base-content/60">
                            Order #{order.id || `00${index + 1}`}
                          </p>
                          <p className="text-base font-bold text-base-content/60">
                            ₦{(order.cost || 0).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate("/dashboard/payments")}
                          className={`btn ${getStatusBadgeClass(
                            order.paymentStatus
                          )} btn-sm`}
                        >
                          {order.paymentStatus === "Pending"
                            ? "Pay Now"
                            : order.paymentStatus}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History placeholder */}
            <div>
              <h4 className="font-semibold mb-4">Payment History</h4>
              <div className="text-center py-8">
                <CreditCardIcon
                  size={48}
                  className="mx-auto text-base-content/30 mb-4"
                />
                <p className="text-base-content/60">
                  Payment history will appear here
                </p>
              </div>
            </div>

            {/* Payment Methods placeholder */}
            <div>
              <h4 className="font-semibold mb-4">Saved Payment Methods</h4>
              <div className="text-center py-8">
                <p className="text-base-content/60 mb-4">
                  No saved payment methods
                </p>
                <button className="btn btn-outline btn-sm">
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>
        )}
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
