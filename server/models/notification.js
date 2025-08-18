import { ObjectId } from "mongodb";

// Notification schema for MongoDB validation
export const notificationSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "userId",
      "type",
      "title",
      "message",
      "priority",
      "read",
      "createdAt",
    ],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      userId: {
        bsonType: "objectId",
        description: "User ID who receives the notification",
      },
      type: {
        bsonType: "string",
        enum: [
          "order",
          "payment",
          "delivery",
          "measurement",
          "promotion",
          "system",
        ],
        description: "Type of notification",
      },
      title: {
        bsonType: "string",
        minLength: 1,
        maxLength: 100,
        description: "Notification title",
      },
      message: {
        bsonType: "string",
        minLength: 1,
        maxLength: 500,
        description: "Notification message content",
      },
      data: {
        bsonType: "object",
        description:
          "Additional data related to the notification (orderId, paymentId, etc.)",
      },
      priority: {
        bsonType: "string",
        enum: ["low", "medium", "high"],
        description: "Notification priority level",
      },
      read: {
        bsonType: "bool",
        description: "Whether the notification has been read",
      },
      createdAt: {
        bsonType: "date",
        description: "When the notification was created",
      },
      readAt: {
        bsonType: ["date", "null"],
        description: "When the notification was read (null if unread)",
      },
    },
  },
};

// Notification indexes for optimal performance
export const notificationIndexes = [
  { key: { userId: 1 }, name: "userId_1" },
  { key: { read: 1 }, name: "read_1" },
  { key: { type: 1 }, name: "type_1" },
  { key: { priority: 1 }, name: "priority_1" },
  { key: { createdAt: -1 }, name: "createdAt_-1" },
  { key: { userId: 1, read: 1 }, name: "userId_1_read_1" },
  { key: { userId: 1, type: 1 }, name: "userId_1_type_1" },
  { key: { userId: 1, createdAt: -1 }, name: "userId_1_createdAt_-1" },
];

class Notification {
  constructor(collection) {
    this.collection = collection;
  }

  // Create a new notification
  async create(notificationData) {
    const notification = {
      ...notificationData,
      read: false,
      createdAt: new Date(),
      readAt: null,
    };

    const result = await this.collection.insertOne(notification);
    return { ...notification, _id: result.insertedId };
  }

  // Get notifications for a user
  async getByUserId(userId, options = {}) {
    const { limit = 50, skip = 0, unreadOnly = false, type = null } = options;

    const query = { userId: new ObjectId(userId) };

    if (unreadOnly) {
      query.read = false;
    }

    if (type) {
      query.type = type;
    }

    const notifications = await this.collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    return notifications;
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const result = await this.collection.updateOne(
      {
        _id: new ObjectId(notificationId),
        userId: new ObjectId(userId),
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    const result = await this.collection.updateMany(
      {
        userId: new ObjectId(userId),
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return result.modifiedCount;
  }

  // Get unread count
  async getUnreadCount(userId) {
    const count = await this.collection.countDocuments({
      userId: new ObjectId(userId),
      read: false,
    });

    return count;
  }

  // Delete notification
  async delete(notificationId, userId) {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(notificationId),
      userId: new ObjectId(userId),
    });

    return result.deletedCount > 0;
  }

  // Bulk operations
  async bulkMarkAsRead(notificationIds, userId) {
    const result = await this.collection.updateMany(
      {
        _id: { $in: notificationIds.map((id) => new ObjectId(id)) },
        userId: new ObjectId(userId),
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return result.modifiedCount;
  }

  async bulkDelete(notificationIds, userId) {
    const result = await this.collection.deleteMany({
      _id: { $in: notificationIds.map((id) => new ObjectId(id)) },
      userId: new ObjectId(userId),
    });

    return result.deletedCount;
  }
}

export default Notification;
