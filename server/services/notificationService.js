import Notification from "../models/notification.js";

class NotificationService {
  constructor(collection) {
    this.notification = new Notification(collection);
  }

  // Create notification when order is placed
  async createOrderNotification(userId, orderId, orderData) {
    const notifications = [];

    // Order confirmation
    notifications.push(
      await this.notification.create({
        userId,
        type: "order",
        title: "Order Confirmed",
        message: `Your ${orderData.garment} order has been confirmed and is being processed`,
        data: { orderId },
        priority: "high",
      })
    );

    return notifications;
  }

  // Create notification when payment is processed
  async createPaymentNotification(userId, paymentData) {
    const { status, amount, orderId } = paymentData;

    if (status === "success") {
      return await this.notification.create({
        userId,
        type: "payment",
        title: "Payment Successful",
        message: `Payment of ₦${amount.toLocaleString()} processed successfully`,
        data: { paymentId: paymentData._id, orderId },
        priority: "medium",
      });
    } else {
      return await this.notification.create({
        userId,
        type: "payment",
        title: "Payment Failed",
        message: "Payment processing failed. Please try again.",
        data: { paymentId: paymentData._id, orderId },
        priority: "high",
      });
    }
  }

  // Create notification when order status changes
  async createOrderStatusNotification(
    userId,
    orderId,
    oldStatus,
    newStatus,
    garment
  ) {
    const statusMessages = {
      in_progress: `Your ${garment} is now being tailored`,
      ready: `Your ${garment} is ready for pickup`,
      delivered: `Your ${garment} has been delivered`,
      cancelled: `Your ${garment} order has been cancelled`,
    };

    const priorities = {
      in_progress: "medium",
      ready: "high",
      delivered: "medium",
      cancelled: "high",
    };

    if (statusMessages[newStatus]) {
      return await this.notification.create({
        userId,
        type: "order",
        title: "Order Status Updated",
        message: statusMessages[newStatus],
        data: { orderId, oldStatus, newStatus },
        priority: priorities[newStatus],
      });
    }
  }

  // Create measurement reminder
  async createMeasurementReminder(userId) {
    return await this.notification.create({
      userId,
      type: "measurement",
      title: "Update Your Measurements",
      message: "Please update your measurements for better fitting",
      data: {},
      priority: "low",
    });
  }

  // Create promotional notification
  async createPromotionalNotification(userId, promoData) {
    return await this.notification.create({
      userId,
      type: "promotion",
      title: promoData.title,
      message: promoData.message,
      data: { promoCode: promoData.code },
      priority: "medium",
    });
  }

  // Create system notification
  async createSystemNotification(userId, title, message, priority = "low") {
    return await this.notification.create({
      userId,
      type: "system",
      title,
      message,
      data: {},
      priority,
    });
  }

  // Get user notifications with pagination
  async getUserNotifications(userId, options = {}) {
    return await this.notification.getByUserId(userId, options);
  }

  // Get unread count
  async getUnreadCount(userId) {
    return await this.notification.getUnreadCount(userId);
  }

  // Mark as read
  async markAsRead(notificationId, userId) {
    return await this.notification.markAsRead(notificationId, userId);
  }

  // Mark all as read
  async markAllAsRead(userId) {
    return await this.notification.markAllAsRead(userId);
  }
}

export default NotificationService;
