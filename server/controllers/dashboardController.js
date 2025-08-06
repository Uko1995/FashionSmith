import { collections } from "../config/db.js";
import { ObjectId } from "mongodb";

// Get user dashboard data
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile information
    const user = await collections.users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0,
          refreshToken: 0,
          token: 0,
          tokenExpiration: 0,
        },
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's orders (recent 5)
    const recentOrders = await collections.orders
      .find({ userId: new ObjectId(userId) })
      .sort({ orderDate: -1 })
      .limit(5)
      .toArray();

    // Get user's measurements if they exist
    const measurements = await collections.measurements.findOne({
      userId: new ObjectId(userId),
    });

    // Get user statistics
    const [totalOrders, pendingOrders, completedOrders] = await Promise.all([
      collections.orders.countDocuments({ userId: new ObjectId(userId) }),
      collections.orders.countDocuments({
        userId: new ObjectId(userId),
        status: "Pending",
      }),
      collections.orders.countDocuments({
        userId: new ObjectId(userId),
        status: "Delivered",
      }),
    ]);

    // Get featured products for recommendations
    const recommendedProducts = await collections.products
      .find({
        featured: true,
        available: true,
      })
      .limit(4)
      .toArray();

    // Calculate total spent using the new totalCost field
    const orderStats = await collections.orders
      .aggregate([
        {
          $match: { userId: new ObjectId(userId) },
        },
        {
          $group: {
            _id: null,
            totalSpent: {
              $sum: "$totalCost",
            },
          },
        },
      ])
      .toArray();

    const totalSpent = orderStats.length > 0 ? orderStats[0].totalSpent : 0;

    // Prepare dashboard data
    const dashboardData = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        memberSince: user.createdAt,
      },
      statistics: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent: totalSpent || 0,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order._id,
        garment: order.garment,
        quantity: order.quantity,
        selectedFabric: order.selectedFabric,
        selectedColor: order.selectedColor,
        unitPrice: order.unitPrice,
        totalCost: order.totalCost,
        status: order.status,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
      })),
      measurements: measurements
        ? {
            hasMeasurements: true,
            lastUpdated: measurements.updatedAt || measurements.createdAt,
            // Don't send actual measurement values for privacy
            measurementCount: Object.keys(measurements).filter(
              (key) =>
                !["_id", "userId", "createdAt", "updatedAt"].includes(key)
            ).length,
          }
        : {
            hasMeasurements: false,
            measurementCount: 0,
          },
      recommendations: recommendedProducts.map((product) => ({
        id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        basePrice: product.basePrice,
        category: product.category,
      })),
      quickActions: [
        {
          title: "New Order",
          description: "Create a new custom garment order",
          icon: "plus",
          link: "/order/new",
        },
        {
          title: "My Measurements",
          description: measurements
            ? "Update your measurements"
            : "Add your measurements",
          icon: "ruler",
          link: "/measurements",
        },
        {
          title: "Order History",
          description: "View all your previous orders",
          icon: "history",
          link: "/orders",
        },
        {
          title: "Profile Settings",
          description: "Update your profile information",
          icon: "settings",
          link: "/profile",
        },
      ],
    };

    res.json({
      success: true,
      data: dashboardData,
      message: `Welcome ${user.firstName || user.username}!`,
    });
  } catch (error) {
    console.error("Error fetching user dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Error loading dashboard",
      error: error.message,
    });
  }
};

// Get user's order history with pagination
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "orderDate",
      sortOrder = "desc",
    } = req.query;

    const query = { userId: new ObjectId(userId) };

    // Add status filter if provided
    if (status && status !== "all") {
      query.Status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [orders, totalCount] = await Promise.all([
      collections.orders
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray(),
      collections.orders.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      garment: order.garment,
      quantity: order.quantity,
      color: order.color,
      fabric: order.fabric,
      price: order.Cost || order.price,
      status: order.Status,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      deliveryAddress: order.deliveryAddress,
    }));

    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get user notifications/alerts
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get pending orders that might need attention
    const pendingOrders = await collections.orders
      .find({
        userId: new ObjectId(userId),
        Status: { $in: ["Pending", "In Progress"] },
      })
      .sort({ orderDate: -1 })
      .toArray();

    // Check if user has measurements
    const hasMeasurements = await collections.measurements.findOne({
      userId: new ObjectId(userId),
    });

    // Create notifications array
    const notifications = [];

    // Add measurement reminder if no measurements
    if (!hasMeasurements) {
      notifications.push({
        id: "measurements-reminder",
        type: "info",
        title: "Add Your Measurements",
        message:
          "Complete your profile by adding your measurements for better fitting garments.",
        action: {
          text: "Add Measurements",
          link: "/measurements",
        },
        priority: "medium",
        createdAt: new Date(),
      });
    }

    // Add order status notifications
    pendingOrders.forEach((order) => {
      const daysSinceOrder = Math.floor(
        (new Date() - new Date(order.orderDate)) / (1000 * 60 * 60 * 24)
      );

      if (order.Status === "Pending" && daysSinceOrder > 2) {
        notifications.push({
          id: `order-${order._id}`,
          type: "warning",
          title: "Order Update",
          message: `Your ${order.garment} order is still pending. We'll update you soon!`,
          action: {
            text: "View Order",
            link: `/orders/${order._id}`,
          },
          priority: "high",
          createdAt: order.orderDate,
        });
      }
    });

    // Add welcome notification for new users (registered within last 7 days)
    const user = await collections.users.findOne({ _id: new ObjectId(userId) });
    const daysSinceRegistration = Math.floor(
      (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceRegistration <= 7) {
      notifications.push({
        id: "welcome",
        type: "success",
        title: "Welcome to FashionSmith!",
        message:
          "Thank you for joining us. Explore our services and create your first custom garment.",
        action: {
          text: "Browse Products",
          link: "/products",
        },
        priority: "low",
        createdAt: user.createdAt,
      });
    }

    // Sort notifications by priority and date
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    notifications.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      unreadCount: notifications.length, // In a real app, you'd track read/unread status
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};
