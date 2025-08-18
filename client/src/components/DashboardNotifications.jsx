/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BellIcon,
  CheckIcon,
  //   XMarkIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  WarningIcon,
  //   InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  MoneyIcon,
  TruckIcon,
  UserIcon,
  GearIcon,
  SparkleIcon,
  ArchiveIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { notificationAPI } from "../services/api";
import SEO from "./SEO";

export default function DashboardNotifications() {
  const queryClient = useQueryClient();

  // State management
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Fetch notifications from API
  const {
    data: notificationsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", filter, showUnreadOnly],
    queryFn: async () => {
      const params = {};

      // Add filter parameters
      if (filter !== "all") {
        params.type = filter;
      }

      if (showUnreadOnly) {
        params.unreadOnly = true;
      }

      // Add pagination (can be expanded later)
      params.page = 1;
      params.limit = 50;

      const response = await notificationAPI.getNotifications(params);
      return response.data;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Extract notifications from API response
  const notifications = notificationsResponse?.data?.notifications || [];

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const response = await notificationAPI.markAsRead(notificationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification marked as read");
    },
    onError: (error) => {
      console.error("Mark as read error:", error);
      toast.error("Failed to mark notification as read");
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      const response = await notificationAPI.deleteNotification(notificationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
    onError: (error) => {
      console.error("Delete notification error:", error);
      toast.error("Failed to delete notification");
    },
  });

  // Bulk actions mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, notificationIds }) => {
      const response = await notificationAPI.bulkAction(
        action,
        notificationIds
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setSelectedNotifications([]);
      toast.success(
        `${variables.action === "markAsRead" ? "Marked as read" : "Deleted"} ${
          variables.notificationIds.length
        } notifications`
      );
    },
    onError: (error) => {
      console.error("Bulk action error:", error);
      toast.error("Bulk action failed");
    },
  });

  // Get notification icon based on type
  const getNotificationIcon = (type, priority) => {
    const iconProps = { className: "w-6 h-6" };

    switch (type) {
      case "order":
        return <TruckIcon {...iconProps} />;
      case "payment":
        return <MoneyIcon {...iconProps} />;
      case "delivery":
        return <ArchiveIcon {...iconProps} />;
      case "measurement":
        return <UserIcon {...iconProps} />;
      case "promotion":
        return <SparkleIcon {...iconProps} />;
      case "system":
        return <GearIcon {...iconProps} />;
      default:
        return <BellIcon {...iconProps} />;
    }
  };

  // Get notification color based on priority and read status
  const getNotificationStyle = (priority, read) => {
    if (!read) {
      switch (priority) {
        case "high":
          return "border-l-4 border-l-error bg-error/5";
        case "medium":
          return "border-l-4 border-l-warning bg-warning/5";
        default:
          return "border-l-4 border-l-info bg-info/5";
      }
    }
    return "border-l-4 border-l-base-300 bg-base-100";
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const timestampDate = new Date(timestamp); // Convert ISO string to Date
    const now = new Date();
    const diff = now - timestampDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestampDate.toLocaleDateString();
  };

  // Filter notifications
  const filteredNotifications =
    notifications?.filter((notification) => {
      const matchesFilter = filter === "all" || notification.type === filter;
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesReadFilter = !showUnreadOnly || !notification.read;

      return matchesFilter && matchesSearch && matchesReadFilter;
    }) || [];

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id);
    }
    // Navigate to action URL if provided (check both actionUrl and data.actionUrl)
    const actionUrl = notification.actionUrl || notification.data?.actionUrl;
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedNotifications.length === 0) {
      toast.error("Please select notifications first");
      return;
    }

    bulkActionMutation.mutate({
      action,
      notificationIds: selectedNotifications,
    });
  };

  // Notification type options
  const notificationTypes = [
    { value: "all", label: "All Notifications", icon: BellIcon },
    { value: "order", label: "Orders", icon: TruckIcon },
    { value: "payment", label: "Payments", icon: MoneyIcon },
    { value: "delivery", label: "Delivery", icon: ArchiveIcon },
    { value: "measurement", label: "Measurements", icon: UserIcon },
    { value: "promotion", label: "Promotions", icon: SparkleIcon },
    { value: "system", label: "System", icon: GearIcon },
  ];

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/70">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="alert alert-error">
            <WarningIcon className="w-5 h-5" />
            <span>Failed to load notifications: {error.message}</span>
            <button
              onClick={() => refetch()}
              className="btn btn-sm btn-outline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4 md:p-6 lg:p-8">
      <SEO
        title="Notifications - FashionSmith"
        description="Stay updated with your orders, payments, and important notifications."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Notifications
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto mb-4">
            Stay updated with your orders, payments, and important updates.
          </p>
          {unreadCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
              <BellIcon className="w-4 h-4" />
              <span className="font-medium">
                {unreadCount} unread notifications
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="card bg-base-100 shadow-xl border border-base-300/50 mb-6">
          <div className="card-body p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                {/* Type Filter */}
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-outline gap-2"
                  >
                    <FunnelIcon className="w-4 h-4" />
                    {notificationTypes.find((t) => t.value === filter)?.label}
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300"
                  >
                    {notificationTypes.map((type) => (
                      <li key={type.value}>
                        <button
                          onClick={() => setFilter(type.value)}
                          className={`flex items-center gap-2 ${
                            filter === type.value ? "active" : ""
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unread Toggle */}
                <label className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={showUnreadOnly}
                    onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  />
                  <span className="label-text">Unread only</span>
                </label>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedNotifications.length} notifications selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction("markRead")}
                    className="btn btn-sm btn-primary gap-2"
                    disabled={bulkActionMutation.isPending}
                  >
                    <CheckIcon className="w-4 h-4" />
                    Mark as Read
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="btn btn-sm btn-error gap-2"
                    disabled={bulkActionMutation.isPending}
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="card bg-base-100 shadow-xl border border-base-300/50">
              <div className="card-body p-12 text-center">
                <BellIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No notifications found
                </h3>
                <p className="text-base-content/70">
                  {searchTerm || filter !== "all" || showUnreadOnly
                    ? "Try adjusting your filters or search terms."
                    : "You're all caught up! New notifications will appear here."}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`card bg-base-100 shadow-xl border border-base-300/50 cursor-pointer hover:shadow-2xl transition-all duration-200 ${getNotificationStyle(
                  notification.priority,
                  notification.read
                )}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="card-body p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary mt-1"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedNotifications((prev) => [
                            ...prev,
                            notification._id,
                          ]);
                        } else {
                          setSelectedNotifications((prev) =>
                            prev.filter((id) => id !== notification._id)
                          );
                        }
                      }}
                    />

                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 p-2 rounded-full ${
                        notification.priority === "high"
                          ? "bg-error/10 text-error"
                          : notification.priority === "medium"
                          ? "bg-warning/10 text-warning"
                          : "bg-info/10 text-info"
                      }`}
                    >
                      {getNotificationIcon(
                        notification.type,
                        notification.priority
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`font-semibold ${
                                !notification.read
                                  ? "text-base-content"
                                  : "text-base-content/70"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              !notification.read
                                ? "text-base-content/80"
                                : "text-base-content/60"
                            } mb-2`}
                          >
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-base-content/50">
                            <span>
                              {formatTimestamp(notification.createdAt)}
                            </span>
                            <span className="capitalize">
                              {notification.type}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full ${
                                notification.priority === "high"
                                  ? "bg-error/10 text-error"
                                  : notification.priority === "medium"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-info/10 text-info"
                              }`}
                            >
                              {notification.priority}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadMutation.mutate(notification._id);
                              }}
                              className="btn btn-ghost btn-xs gap-1"
                              disabled={markAsReadMutation.isPending}
                            >
                              <CheckIcon className="w-3 h-3" />
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(
                                notification._id
                              );
                            }}
                            className="btn btn-ghost btn-xs text-error gap-1"
                            disabled={deleteNotificationMutation.isPending}
                          >
                            <TrashIcon className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="btn btn-outline btn-wide">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
