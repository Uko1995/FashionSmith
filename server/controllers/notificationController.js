import NotificationService from "../services/notificationService.js";
import { collections } from "../config/db.js";

// Initialize the notification service with the notifications collection
const notificationService = new NotificationService(collections.notifications);

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type, unreadOnly = false } = req.query;

    const skip = (page - 1) * limit;
    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      type: type || null,
      unreadOnly: unreadOnly === "true",
    };

    const notifications = await notificationService.getUserNotifications(
      userId,
      options
    );
    const unreadCount = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasMore: notifications.length === parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    const success = await notificationService.markAsRead(
      notificationId,
      userId
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: `${count} notifications marked as read`,
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    const success = await notificationService.notification.delete(
      notificationId,
      userId
    );

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

// Bulk operations
export const bulkAction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { action, notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification IDs",
      });
    }

    let result;
    switch (action) {
      case "markAsRead":
        result = await notificationService.notification.bulkMarkAsRead(
          notificationIds,
          userId
        );
        break;
      case "delete":
        result = await notificationService.notification.bulkDelete(
          notificationIds,
          userId
        );
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action",
        });
    }

    res.status(200).json({
      success: true,
      message: `${result} notifications ${
        action === "markAsRead" ? "marked as read" : "deleted"
      }`,
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform bulk action",
    });
  }
};
