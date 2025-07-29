import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

import { validateUser, prepareUserData } from "../models/user.js";
import {
  validateUserVerification,
  prepareUserVerificationData,
} from "../models/userVerification.js";
import {
  validateMeasurement,
  prepareMeasurementData,
} from "../models/measurements.js";
import { validateOrder, prepareOrderData } from "../models/order.js";
import sendEmail from "../utils/email.js";
import { client, collections } from "../config/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenGenerator.js";

dotenv.config();

const userCollection = client.db("fashionsmith").collection("users");
const ordersCollection = collections.orders;
const productsCollection = collections.products;
const measurementsCollection = collections.measurements;
const userVerificationsCollection = collections.userVerifications;

const signUp = async (req, res) => {
  let { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send({
      message: "All fields are required",
    });
  }

  const errors = [];
  if (password.length < 8) errors.push("at least 8 characters");
  if (!/[0-9]/.test(password)) errors.push("a number");
  if (!/[A-Z]/.test(password)) errors.push("an uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("a lowercase letter");
  if (!/[!@#$%^&*]/.test(password)) errors.push("a special character");

  if (errors.length) {
    return res
      .status(400)
      .json({ message: "Password must contain: " + errors.join(", ") });
  }

  let newUser;
  let insertedUser;

  try {
    const existingUser = await userCollection.findOne({
      email: req.body.email,
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const username = `${firstName.trim()} ${lastName.trim()}`;

      // Prepare user data for validation and insertion
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        username,
        role: "user",
        isVerified: false,
        refreshToken: null,
      };

      // Use prepareUserData to ensure all defaults are applied correctly
      const preparedUser = prepareUserData(userData);

      // Insert the user
      newUser = await userCollection.insertOne(preparedUser);
      if (!newUser.acknowledged) {
        return res.status(400).json({
          message: "User registration failed",
        });
      }
      insertedUser = await userCollection.findOne({
        _id: newUser.insertedId,
      });
      if (!insertedUser) {
        return res.status(404).json({
          message: "User not found after registration",
        });
      }
    }
    return res.status(201).json({
      success: true,
      message: `${insertedUser.username} registered successfully`,
      user: {
        id: insertedUser._id,
        firstName: insertedUser.firstName,
        lastName: insertedUser.lastName,
        username: insertedUser.username,
        email: insertedUser.email,
        role: insertedUser.role,
      },
      redirectTo: "/login",
      nextStep: "Please log in to access your dashboard",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "An error occurred, cannot register user",
    });
  }
};

const deleteUsers = async (req, res) => {
  try {
    const users = await userCollection.deleteMany({});

    res.send("All users deleted successfully");
  } catch (error) {
    console.error("Error deleting users:", error);
    return res.status(500).json({
      message: "An error occurred while deleting users",
    });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userCollection.findOne(
      { email: req?.user?.email },
      {
        projection: {
          _id: 0,
          password: 0,
          refreshToken: 0,
          createdAt: 0,
          __v: 0,
        },
      }
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.json(user);
  } catch (error) {
    console.error("Error:", error.message, error.stack);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  try {
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        message: "incorrect password",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await userCollection.updateOne(
      { _id: user._id },
      { $set: { refreshToken: user.refreshToken } }
    );

    return res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "None",
        secure: "true",
        maxAge: 1000 * 60 * 15, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: "true",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
      .json({
        success: true,
        message: `Welcome back, ${user.firstName || user.username}!`,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        redirectTo: "/dashboard",
        dashboardUrl: "/api/dashboard",
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred, please try again",
    });
  }
};

export const refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(401);

  try {
    const user = await userCollection.findOne({
      refreshToken: cookies.refreshToken,
    });
    if (!user) return res.sendStatus(403);

    jwt.verify(
      cookies.refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || decoded.id !== user._id.toString())
          return res.sendStatus(403);

        const newAccessToken = generateAccessToken(user);
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });
        res.json({ message: "Access token refreshed" });
      }
    );
  } catch (error) {
    console.error("Error:", error.message, error.stack);
    res.sendStatus(500);
  }
};

export const logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(204);

  try {
    const user = await userCollection.findOne({
      refreshToken: cookies.refreshToken,
    });
    if (user) {
      await userCollection.updateOne(
        { _id: user._id },
        { $set: { refreshToken: null } }
      );
    }

    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.sendStatus(500);
  }
};

const removeUser = async (req, res) => {
  try {
    const deletedUser = await userCollection.findOneAndDelete({
      email: req.user.email,
    });
    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.json({
      message: `${deletedUser.username} deleted successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
};

const updateUserInfo = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.password = hashedPassword;
    }
    if (firstName || lastName) {
      updates.username = `${updates.firstName || req.user.firstName} ${
        updates.lastName || req.user.lastName
      }`;
    }

    const updatedUser = await userCollection.findOneAndUpdate(
      { email: req.user.email },
      { $set: updates },
      { new: true, runValidators: true },
      { returnDocument: "after" } // Ensure the updated document is returned
    );
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: `${updatedUser.username} updated successfully`,
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred: " + error.message,
    });
  }
};

const addMeasurement = async (req, res) => {
  const {
    Neck,
    Shoulder,
    Chest,
    NaturalWaist,
    Hip,
    KaftanLength,
    SuitLength,
    LongSleeve,
    ShortSleeve,
    MidSleeve,
    ShortSleeveWidth,
    TrouserLength,
    ThighWidth,
    KneeWidth,
    AnkleWidth,
  } = req.body;

  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const userId = new ObjectId(req.user.id);

    // Prepare measurement data
    const measurementData = {
      userId,
      Neck,
      Shoulder,
      Chest,
      NaturalWaist,
      Hip,
      KaftanLength,
      SuitLength,
      LongSleeve,
      ShortSleeve,
      MidSleeve,
      ShortSleeveWidth,
      TrouserLength,
      ThighWidth,
      KneeWidth,
      AnkleWidth,
    };

    // Validate measurement data
    const validation = validateMeasurement(measurementData);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Measurement validation failed",
        errors: validation.errors,
      });
    }

    // Check if user already has measurements
    const existingMeasurement = await measurementsCollection.findOne({
      userId,
    });

    if (existingMeasurement) {
      // Update existing measurements
      const preparedData = prepareMeasurementData(measurementData);
      const result = await measurementsCollection.updateOne(
        { userId },
        { $set: preparedData }
      );

      if (result.modifiedCount === 0) {
        return res.status(500).json({
          message: "Failed to update measurements",
        });
      }

      return res.json({
        message: "Measurements updated successfully",
      });
    } else {
      // Create new measurements
      const preparedData = prepareMeasurementData(measurementData);
      const result = await measurementsCollection.insertOne(preparedData);

      if (!result.insertedId) {
        return res.status(500).json({
          message: "Failed to add measurements",
        });
      }

      return res.json({
        message: "Measurements added successfully",
      });
    }
  } catch (error) {
    console.error("Error adding/updating measurement:", error);
    return res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

const displayMeasurement = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const userId = new ObjectId(req.user.id);

    // Get user's measurements
    const measurement = await measurementsCollection.findOne(
      { userId },
      { projection: { _id: 0, userId: 0 } }
    );

    if (!measurement) {
      return res.status(404).json({
        message: "No measurements found for this user",
      });
    }

    res.json(measurement);
  } catch (error) {
    console.error("Error fetching measurements:", error);
    return res.status(500).json({
      message: "Failed to fetch measurements",
      error: error.message,
    });
  }
};

const updateMeasurement = async (req, res) => {
  const {
    Neck,
    Shoulder,
    Chest,
    NaturalWaist,
    Hip,
    KaftanLength,
    SuitLength,
    LongSleeve,
    ShortSleeve,
    MidSleeve,
    ShortSleeveWidth,
    TrouserLength,
    ThighWidth,
    KneeWidth,
    AnkleWidth,
  } = req.body;

  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const userId = new ObjectId(req.user.id);

    // Prepare measurement data
    const measurementData = {
      userId,
      Neck,
      Shoulder,
      Chest,
      NaturalWaist,
      Hip,
      KaftanLength,
      SuitLength,
      LongSleeve,
      ShortSleeve,
      MidSleeve,
      ShortSleeveWidth,
      TrouserLength,
      ThighWidth,
      KneeWidth,
      AnkleWidth,
    };

    // Validate measurement data
    const validation = validateMeasurement(measurementData);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Measurement validation failed",
        errors: validation.errors,
      });
    }

    // Update measurements
    const preparedData = prepareMeasurementData(measurementData);
    const result = await measurementsCollection.updateOne(
      { userId },
      { $set: preparedData },
      { upsert: true } // Create if doesn't exist
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return res.status(500).json({
        message: "Failed to update measurements",
      });
    }

    res.json({
      message: "Measurements updated successfully",
    });
  } catch (error) {
    console.error("Error updating measurement:", error);
    return res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

const removeMeasurement = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const userId = new ObjectId(req.user.id);

    // Delete the user's measurements
    const result = await measurementsCollection.deleteOne({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "No measurements found to delete",
      });
    }

    res.json({
      message: "Measurements deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting measurement:", error);
    return res.status(500).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

const createOrder = async (req, res) => {
  const {
    productId,
    quantity,
    selectedFabric,
    selectedColor,
    deliveryDate,
    deliveryAddress,
  } = req.body;

  // Validate required fields
  if (
    !productId ||
    !quantity ||
    !selectedFabric ||
    !selectedColor ||
    !deliveryDate ||
    !deliveryAddress
  ) {
    return res.status(400).json({
      message:
        "All fields are required: productId, quantity, selectedFabric, selectedColor, deliveryDate, deliveryAddress",
    });
  }

  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const userId = new ObjectId(req.user.id);
    const productObjectId = new ObjectId(productId);

    // Fetch the product to get base price and validate fabric/color options
    const product = await productsCollection.findOne({ _id: productObjectId });
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Validate selected fabric
    const fabricOption = product.fabrics?.find(
      (f) => f.name === selectedFabric.name
    );
    if (!fabricOption) {
      return res.status(400).json({
        message: `Fabric "${selectedFabric.name}" is not available for this product`,
      });
    }
    if (!fabricOption.available) {
      return res.status(400).json({
        message: `Fabric "${selectedFabric.name}" is currently unavailable`,
      });
    }

    // Validate selected color
    const colorOption = product.colors?.find(
      (c) => c.name === selectedColor.name
    );
    if (!colorOption) {
      return res.status(400).json({
        message: `Color "${selectedColor.name}" is not available for this product`,
      });
    }
    if (!colorOption.available) {
      return res.status(400).json({
        message: `Color "${selectedColor.name}" is currently unavailable`,
      });
    }

    // Validate delivery date
    const deliveryDateObj = new Date(deliveryDate);
    if (isNaN(deliveryDateObj.getTime()) || deliveryDateObj <= new Date()) {
      return res.status(400).json({
        message: "Delivery date must be a valid future date",
      });
    }

    // Calculate total price
    const basePrice = product.basePrice || 0;
    const fabricPrice = fabricOption.price || 0;
    const colorPrice = colorOption.extraPrice || 0;
    const unitPrice = basePrice + fabricPrice + colorPrice;
    const totalCost = unitPrice * quantity;

    // Prepare order data
    const orderData = {
      userId,
      productId: productObjectId,
      garment: product.name, // For reference
      quantity,
      selectedFabric: {
        name: fabricOption.name,
        price: fabricOption.price,
      },
      selectedColor: {
        name: colorOption.name,
        extraPrice: colorOption.extraPrice || 0,
        hex: colorOption.hex,
      },
      unitPrice,
      totalCost,
      deliveryDate: deliveryDateObj,
      deliveryAddress,
      status: "Pending",
      paymentStatus: "Pending",
    };

    // Validate order data
    const validation = validateOrder(orderData);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Order validation failed",
        errors: validation.errors,
      });
    }

    // Prepare and insert order
    const preparedOrder = prepareOrderData(orderData);
    const result = await ordersCollection.insertOne(preparedOrder);

    if (!result.insertedId) {
      return res.status(500).json({
        message: "Failed to create order",
      });
    }

    res.status(201).json({
      message: `Order created successfully, your order ID is ${result.insertedId}. Please proceed to payment.`,
      orderId: result.insertedId,
      orderDetails: {
        product: product.name,
        quantity,
        unitPrice,
        totalCost,
        selectedFabric: orderData.selectedFabric,
        selectedColor: orderData.selectedColor,
        deliveryDate,
      },
    });
  } catch (error) {
    console.error("Order creation error:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    return res.status(500).json({
      message: "Order creation failed",
      error: error.message,
    });
  }
};

const updateOrder = async (req, res) => {
  const {
    orderId,
    quantity,
    selectedFabric,
    selectedColor,
    deliveryDate,
    deliveryAddress,
    status,
  } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const orderObjectId = new ObjectId(orderId);
    const userId = new ObjectId(req.user.id);

    // Find the existing order
    const existingOrder = await ordersCollection.findOne({
      _id: orderObjectId,
      userId: userId,
    });

    if (!existingOrder) {
      return res.status(404).json({
        message: "Order not found or you don't have permission to update it",
      });
    }

    // Build update object with only provided fields
    const updateData = {
      updatedAt: new Date(),
    };

    // If quantity is being updated, recalculate pricing
    if (quantity !== undefined) {
      // Get the product to recalculate pricing
      const product = await productsCollection.findOne({
        _id: existingOrder.productId,
      });
      if (!product) {
        return res.status(404).json({
          message: "Associated product not found",
        });
      }

      const fabricPrice = existingOrder.selectedFabric?.price || 0;
      const colorPrice = existingOrder.selectedColor?.extraPrice || 0;
      const unitPrice = product.basePrice + fabricPrice + colorPrice;
      const totalCost = unitPrice * quantity;

      updateData.quantity = quantity;
      updateData.unitPrice = unitPrice;
      updateData.totalCost = totalCost;
    }

    // Update fabric selection if provided
    if (selectedFabric) {
      // Validate against product options
      const product = await productsCollection.findOne({
        _id: existingOrder.productId,
      });
      const fabricOption = product?.fabrics?.find(
        (f) => f.name === selectedFabric.name
      );

      if (!fabricOption || !fabricOption.available) {
        return res.status(400).json({
          message: `Fabric "${selectedFabric.name}" is not available for this product`,
        });
      }

      updateData.selectedFabric = {
        name: fabricOption.name,
        price: fabricOption.price,
      };
    }

    // Update color selection if provided
    if (selectedColor) {
      // Validate against product options
      const product = await productsCollection.findOne({
        _id: existingOrder.productId,
      });
      const colorOption = product?.colors?.find(
        (c) => c.name === selectedColor.name
      );

      if (!colorOption || !colorOption.available) {
        return res.status(400).json({
          message: `Color "${selectedColor.name}" is not available for this product`,
        });
      }

      updateData.selectedColor = {
        name: colorOption.name,
        extraPrice: colorOption.extraPrice || 0,
        hex: colorOption.hex,
      };
    }

    // Update delivery date if provided
    if (deliveryDate) {
      const deliveryDateObj = new Date(deliveryDate);
      if (isNaN(deliveryDateObj.getTime()) || deliveryDateObj <= new Date()) {
        return res.status(400).json({
          message: "Delivery date must be a valid future date",
        });
      }
      updateData.deliveryDate = deliveryDateObj;
    }

    // Update delivery address if provided
    if (deliveryAddress) {
      updateData.deliveryAddress = deliveryAddress;
    }

    // Update status if provided
    if (status) {
      updateData.status = status;
    }

    // Perform the update
    const result = await ordersCollection.updateOne(
      { _id: orderObjectId, userId: userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Order not found or you don't have permission to update it",
      });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({
        message: "No changes were made to the order",
      });
    }

    res.json({
      message: "Order updated successfully",
      updatedFields: Object.keys(updateData).filter(
        (key) => key !== "updatedAt"
      ),
    });
  } catch (error) {
    console.error("Order update error:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    return res.status(500).json({
      message: "Order update failed",
      error: error.message,
    });
  }
};

const showOrder = async (req, res) => {
  try {
    const orders = await ordersCollection.find({}).toArray();
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        message: "No orders found",
      });
    }
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const removeOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const orderObjectId = new ObjectId(orderId);
    const userId = new ObjectId(req.user.id);

    // Delete the order (only if it belongs to the authenticated user)
    const result = await ordersCollection.deleteOne({
      _id: orderObjectId,
      userId: userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Order not found or you don't have permission to delete it",
      });
    }

    res.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({
      message: "Failed to delete order",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  try {
    const uniqueString = uuidv4();
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + 1 * 60 * 10 * 1000); // 10 minutes
    const resetLink = `http://localhost:3000/users/resetPassword/${uniqueString}`;

    // Prepare user verification data
    const verificationData = {
      email: email,
      uniqueString,
      createdAt,
      expiresAt,
      type: "password_reset",
    };

    // Validate the data
    const validation = validateUserVerification(verificationData);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Verification data validation failed",
        errors: validation.errors,
      });
    }

    // Prepare and insert verification record
    const preparedData = prepareUserVerificationData(verificationData);
    const result = await userVerificationsCollection.insertOne(preparedData);

    if (!result.insertedId) {
      return res.status(500).json({
        message: "Failed to create password reset request",
      });
    }

    console.log("User verification saved:", result.insertedId);

    // Send reset email
    const subject = "Password Reset Link";
    const html = `<p>Click on this link to reset your password: <a href="${resetLink}">Click here</a></p>`;

    await sendEmail(email, subject, html);

    res.json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Error in forgot password:", error.message, error.stack);
    res.status(500).json({
      message: "Failed to process password reset request",
      error: error.message,
    });
  }
};

const resetPasswordGet = async (req, res) => {
  const { uniqueString } = req.params;

  if (!uniqueString) {
    return res.status(400).json({
      message: "Verification token is required",
    });
  }

  try {
    const userVerify = await userVerificationsCollection.findOne({
      uniqueString,
    });
    if (!userVerify) {
      return res.status(404).json({
        message: "Invalid or expired reset token",
      });
    }

    // Check if token has expired
    if (new Date(userVerify.expiresAt) < new Date()) {
      return res.status(400).json({
        message: "Token has expired, please request a new one",
      });
    }

    res.send(`<form action="/users/resetPassword" method="POST">
            <input type="hidden" name="uniqueString" value="${uniqueString}">
            <input type="password" name="newPassword" placeholder="Enter new password"><br>
            <input type="password" name="confirmPassword" placeholder="Confirm new password"><br>
            <button type="submit">Reset Password</button>
            </form>`);
  } catch (error) {
    console.error("Error in reset password get:", error.message, error.stack);
    res.status(500).json({
      message: "An error occurred while processing reset request",
      error: error.message,
    });
  }
};

const resetPasswordPost = async (req, res) => {
  const { newPassword, confirmPassword, uniqueString } = req.body;

  if (!newPassword || !confirmPassword || !uniqueString) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }

  // Password validation
  const errors = [];
  if (newPassword.length < 8) errors.push("at least 8 characters");
  if (!/[0-9]/.test(newPassword)) errors.push("a number");
  if (!/[A-Z]/.test(newPassword)) errors.push("an uppercase letter");
  if (!/[a-z]/.test(newPassword)) errors.push("a lowercase letter");
  if (!/[!@#$%^&*]/.test(newPassword)) errors.push("a special character");

  if (errors.length) {
    return res.status(400).json({
      message: "Password must contain: " + errors.join(", "),
    });
  }

  try {
    // Find the verification record
    const userVerify = await userVerificationsCollection.findOne({
      uniqueString: uniqueString,
    });

    if (!userVerify) {
      return res.status(404).json({
        message: "Invalid or expired reset token",
      });
    }

    // Check if token has expired
    if (new Date(userVerify.expiresAt) < new Date()) {
      return res.status(400).json({
        message: "Token has expired, please request a new one",
      });
    }

    // Find the user
    const user = await userCollection.findOne({ email: userVerify.email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    const updateResult = await userCollection.updateOne(
      { email: userVerify.email },
      { $set: { password: hashedPassword } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({
        message: "Failed to update password",
      });
    }

    // Delete the used verification token
    await userVerificationsCollection.deleteOne({ uniqueString });

    res.status(200).json({
      message: "Password reset successfully, proceed to login",
    });
  } catch (error) {
    console.error("Error resetting password:", error.message, error.stack);
    res.status(500).json({
      message: "An error occurred while resetting password",
      error: error.message,
    });
  }
};

const emailVerification = async (req, res) => {
  const { uniqueString } = req.params;

  if (!uniqueString) {
    return res.status(400).json({
      message: "Verification token is required",
    });
  }

  try {
    // Find the verification record
    const userVerify = await userVerificationsCollection.findOne({
      uniqueString: uniqueString,
    });

    if (!userVerify) {
      return res.status(404).json({
        message: "Invalid verification token",
      });
    }

    // Check if token has expired
    if (new Date(userVerify.expiresAt) < new Date()) {
      return res.status(400).json({
        message: "Token has expired, please request a new one",
      });
    }

    // Find the user
    const user = await userCollection.findOne({ email: userVerify.email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify that the email matches
    if (user.email !== userVerify.email) {
      return res.status(400).json({
        message: "Email does not match with account",
      });
    }

    // Update user verification status
    const updateResult = await userCollection.updateOne(
      { email: userVerify.email },
      { $set: { isVerified: true } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({
        message: "Failed to verify email",
      });
    }

    // Delete the used verification token
    await userVerificationsCollection.deleteOne({ uniqueString });

    res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error verifying email:", error.message, error.stack);
    res.status(500).json({
      message: "An error occurred while verifying email",
      error: error.message,
    });
  }
};

const users = {
  signUp,
  deleteUsers,
  login,
  refresh,
  logout,
  removeUser,
  updateUserInfo,
  addMeasurement,
  displayMeasurement,
  updateMeasurement,
  removeMeasurement,
  createOrder,
  updateOrder,
  showOrder,
  removeOrder,
  getUser,
  forgotPassword,
  resetPasswordGet,
  resetPasswordPost,
  emailVerification,
};
export default users;
