import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  bulkAction
} from "../controllers/notificationController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

// Get user notifications
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", markAllAsRead);

// Delete notification
router.delete("/:notificationId", deleteNotification);

// Bulk operations
router.post("/bulk", bulkAction);

export default router;
