import { collections } from "../config/db.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const getUsers = async (req, res) => {
  try {
    const users = await collections.users.find({}).toArray();
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Users found",
      });
    }

    const sanitizedUsers = users.map((user) => ({
      id: user._id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      role: user.role,
      isVerified: user.isVerified,
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

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Orders found",
      });
    }

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
    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Products added yet",
      });
    }
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
      featured: featured || false,
      status: "active",
      makingTime: req.body.makingTime || "2-3 weeks", // Default making time
      orderCount: 0, // Initialize order count
      createdAt: new Date(),
      image: req.body.image || "", // Optional image field
    };

    const result = await collections.products.insertOne(newProduct);
    res.status(201).json({
      success: true,
      data: result.ops[0],
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

const admin = {
  getUsers,
  getAllOrders,
  isAdmin,
  getDashboardStats,
  getProducts,
  createProduct,
};

export default admin;
