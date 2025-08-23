import { collections } from "../config/db.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const getUsers = async (req, res) => {
  try {
    const users = await collections.users.find({}).toArray();

    const sanitizedUsers = users.map((user) => ({
      id: user._id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      role: user.role,
      isVerified: user.isVerified,
      profileImage: user.profileImage || null,
    }));

    res.json({
      success: true,
      data: sanitizedUsers,
      count: sanitizedUsers.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Operation failed",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    // Get orders and populate user and product information
    const orders = await collections.orders
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            garment: 1,
            quantity: 1,
            selectedFabric: 1,
            selectedColor: 1,
            unitPrice: 1,
            totalCost: 1,
            orderDate: 1,
            deliveryDate: 1,
            status: 1,
            paymentStatus: 1,
            deliveryAddress: 1,
            "user.username": 1,
            "user.email": 1,
            "user._id": 1,
            "product.name": 1,
            "product.category": 1,
          },
        },
        {
          $sort: { orderDate: -1 },
        },
      ])
      .toArray();

    // Always return success with the orders array (empty or populated)
    const formattedOrders = orders.map((order) => ({
      orderId: order._id,
      garment: order.garment,
      quantity: order.quantity,
      selectedFabric: order.selectedFabric,
      selectedColor: order.selectedColor,
      unitPrice: order.unitPrice,
      totalCost: order.totalCost,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.deliveryAddress,
      user: {
        id: order.user._id,
        username: order.user.username,
        email: order.user.email,
      },
      product: {
        name: order.product.name,
        category: order.product.category,
      },
    }));

    res.json({
      success: true,
      data: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Operation failed",
      error: error.message,
    });
  }
};

const isAdmin = (req, res, next) => {
  // Check if user is admin from JWT payload
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "ADMIN ACCESS ONLY",
    });
  }
};

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [userCount, orderCount, pendingOrders, completedOrders] =
      await Promise.all([
        collections.users.countDocuments({}),
        collections.orders.countDocuments({}),
        collections.orders.countDocuments({ status: "Pending" }),
        collections.orders.countDocuments({ status: "Delivered" }),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers: userCount,
        totalOrders: orderCount,
        pendingOrders,
        completedOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await collections.products.find({}).toArray();

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Operation failed",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, category, basePrice, featured } = req.body;

    // Validate required fields
    if (!name || !description || !category || !basePrice) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create new product
    const newProduct = {
      name,
      description,
      category,
      basePrice,
      price: `From ₦${basePrice.toLocaleString()}`, // Generate display price
      type: req.body.type || name, // Use provided type or default to product name
      featured: featured || false,
      available: true, // Default to available
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      status: "active",
      makingTime: req.body.makingTime || "2-3 weeks", // Default making time
      orderCount: 0, // Initialize order count
      createdAt: new Date(),
      image: req.body.image || "", // Optional image field (legacy)
      images: req.body.images || [], // New images array
    };

    const result = await collections.products.insertOne(newProduct);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating product:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Operation failed",
      error: error.message,
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const userObjectId = new ObjectId(userId);

    // Get user basic info
    const user = await collections.users.findOne({ _id: userObjectId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's orders
    const orders = await collections.orders
      .find({ userId: userObjectId })
      .toArray();

    // Get user's measurements
    const measurements = await collections.measurements
      .find({ userId: userObjectId })
      .toArray();

    // Get user's payments
    const payments = await collections.payments
      .find({ userId: userObjectId })
      .toArray();

    // Get user's notifications
    const notifications = await collections.notifications
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Calculate statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (order) => order.status === "completed"
    ).length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Sanitize user data
    const sanitizedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      profileImage: user.profileImage || null,
    };

    // Sanitize orders
    const sanitizedOrders = orders.map((order) => ({
      id: order._id,
      productName: order.productName,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      deliveryDate: order.deliveryDate,
      customizations: order.customizations,
    }));

    // Sanitize measurements
    const sanitizedMeasurements = measurements.map((measurement) => ({
      id: measurement._id,
      Neck: measurement.Neck,
      Shoulder: measurement.Shoulder,
      Chest: measurement.Chest,
      NaturalWaist: measurement.NaturalWaist,
      Hip: measurement.Hip,
      KaftanLength: measurement.KaftanLength,
      TrouserLength: measurement.TrouserLength,
      TrouserWaist: measurement.TrouserWaist,
      SuitLength: measurement.SuitLength,
      LongSleeve: measurement.LongSleeve,
      ShortSleeve: measurement.ShortSleeve,
      MidSleeve: measurement.MidSleeve,
      ShortSleeveWidth: measurement.ShortSleeveWidth,
      ThighWidth: measurement.ThighWidth,
      KneeWidth: measurement.KneeWidth,
      AnkleWidth: measurement.AnkleWidth,
      ShirtLength: measurement.ShirtLength,
      SuitChest: measurement.SuitChest,
      SuitWaist: measurement.SuitWaist,
      agbadaLength: measurement.agbadaLength,
      waistCoatLength: measurement.waistCoatLength,
      unit: measurement.unit,
      createdAt: measurement.createdAt,
      updatedAt: measurement.updatedAt,
    }));

    res.json({
      success: true,
      data: {
        user: sanitizedUser,
        orders: sanitizedOrders,
        measurements: sanitizedMeasurements,
        payments: payments,
        notifications: notifications,
        statistics: {
          totalOrders,
          completedOrders,
          totalSpent,
          avgOrderValue,
          completionRate:
            totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Operation failed",
      error: error.message,
    });
  }
};

const admin = {
  getUsers,
  getAllOrders,
  isAdmin,
  getDashboardStats,
  getProducts,
  createProduct,
  getUserDetails,
};

export default admin;
