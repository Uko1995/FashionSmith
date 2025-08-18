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
import sendEmail, { emailTemplates } from "../utils/email.js";
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
        message: "This user already exists",
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
        role: "admin",
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

      // Create verification token for email verification
      const uniqueString = uuidv4();
      const createdAt = new Date();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const verificationLink = `${process.env.API_URL}/api/users/verify-email/${uniqueString}`;

      // Prepare verification data
      const verificationData = {
        email: insertedUser.email,
        uniqueString,
        createdAt,
        expiresAt,
        type: "email_verification",
      };

      // Validate and save verification record
      const validation = validateUserVerification(verificationData);
      if (!validation.isValid) {
        // If verification creation fails, we still want to return success for user creation
        console.error(
          "Verification data validation failed:",
          validation.errors
        );
      } else {
        const preparedData = prepareUserVerificationData(verificationData);
        const verificationResult = await userVerificationsCollection.insertOne(
          preparedData
        );

        if (verificationResult.insertedId) {
          // Send verification email
          const subject = "Verify Your Email Address - FashionSmith";
          const html = emailTemplates.verificationEmail(
            insertedUser.username,
            verificationLink
          );
          console.log("insertedUser.userName", insertedUser.username);
          console.log("verificationLink", verificationLink);

          try {
            await sendEmail(insertedUser.email, subject, html);
          } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Don't fail the registration if email sending fails
          }
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: `${insertedUser.username} registered successfully! Please check your email to verify your account.`,
      user: {
        id: insertedUser._id,
        firstName: insertedUser.firstName,
        lastName: insertedUser.lastName,
        username: insertedUser.username,
        email: insertedUser.email,
        role: insertedUser.role,
        verified: insertedUser.isVerified,
      },
      redirectTo: "/verify-email",
      nextStep:
        "Please check your email and click the verification link to activate your account",
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

// Simple auth check that only verifies if user has valid cookies
const authCheck = async (req, res) => {
  try {
    console.log("[AUTH CHECK] Checking authentication cookies...");

    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    console.log("[AUTH CHECK] Tokens present:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    if (!accessToken && !refreshToken) {
      console.log("[AUTH CHECK] No tokens found");
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // If we have an access token, verify it
    if (accessToken) {
      try {
        const decoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );
        console.log("[AUTH CHECK] Access token valid for user:", decoded.id);
        return res.status(200).json({
          success: true,
          message: "Authenticated",
        });
      } catch (err) {
        console.log("[AUTH CHECK] Access token invalid:", err.message);
      }
    }

    // If access token is invalid but we have refresh token, check it
    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        // Check if user still exists with this refresh token
        const user = await userCollection.findOne({
          _id: new ObjectId(decoded.id),
          refreshToken: refreshToken,
        });

        if (user) {
          console.log("[AUTH CHECK] Refresh token valid for user:", decoded.id);
          return res.status(200).json({
            success: true,
            message: "Authenticated",
          });
        } else {
          console.log("[AUTH CHECK] Refresh token not found in database");
        }
      } catch (err) {
        console.log("[AUTH CHECK] Refresh token invalid:", err.message);
      }
    }

    console.log("[AUTH CHECK] No valid tokens found");
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  } catch (error) {
    console.error("[AUTH CHECK] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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

    if (user.isVerified === false) {
      return res.status(403).json({
        message: "Please verify your email address before logging in",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
        redirectTo: "/verify-email",
        nextStep:
          "Check your email for the verification link or request a new one",
      });
    }

    // NEW: Check if user has an existing refresh token
    if (user.refreshToken !== null) {
      console.log(
        "[LOGIN] User has existing refresh token, returning already logged in response"
      );
      return res.status(200).json({
        message: "User already logged in",
        code: "ALREADY_LOGGED_IN",
        redirectTo: "/dashboard",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified,
        },
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
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 15, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        secure: process.env.NODE_ENV === "production",
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
  console.log("[REFRESH] Cookies received:", cookies);
  console.log("[REFRESH] Headers received:", req.headers);
  if (!cookies?.refreshToken) {
    console.log("[REFRESH] No refreshToken cookie found. Returning 401.");
    return res.sendStatus(401);
  }

  try {
    const user = await userCollection.findOne({
      refreshToken: cookies.refreshToken,
    });

    if (!user) {
      console.log(
        "[REFRESH] No user found with matching refreshToken. Clearing cookie and returning 403."
      );
      // Clear the invalid refresh token cookie
      return res
        .clearCookie("refreshToken")
        .clearCookie("accessToken")
        .sendStatus(403);
    }

    jwt.verify(
      cookies.refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          console.log("[REFRESH] JWT verification error:", err);
          console.log(
            "[REFRESH] Clearing invalid refresh token from database and cookies"
          );

          // Clear the invalid refresh token from database and cookies
          await userCollection.updateOne(
            { _id: user._id },
            { $set: { refreshToken: null } }
          );

          return res
            .clearCookie("refreshToken")
            .clearCookie("accessToken")
            .sendStatus(403);
        }

        if (decoded.id !== user._id.toString()) {
          console.log(
            "[REFRESH] Decoded token id does not match user id. Clearing tokens."
          );

          // Clear mismatched tokens
          await userCollection.updateOne(
            { _id: user._id },
            { $set: { refreshToken: null } }
          );

          return res
            .clearCookie("refreshToken")
            .clearCookie("accessToken")
            .sendStatus(403);
        }

        const newAccessToken = generateAccessToken(user);
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          maxAge: 15 * 60 * 1000,
        });
        console.log("[REFRESH] Access token refreshed for user:", user.email);
        res.json({ message: "Access token refreshed" });
      }
    );
  } catch (error) {
    console.error("[REFRESH] Error:", error.message, error.stack);
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
  const { firstName, lastName, email, password, phoneNumber, address } =
    req.body;
  try {
    const updates = {};
    if (firstName) updates.firstName = firstName.trim();
    if (lastName) updates.lastName = lastName.trim();
    if (email) updates.email = email.toLowerCase().trim();
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

    // Handle phone number update
    if (phoneNumber !== undefined) {
      if (phoneNumber === null || phoneNumber === "") {
        updates.phoneNumber = null;
      } else {
        // Validate Nigerian phone number format
        if (!/^\+234\s?\d{3}\s?\d{3}\s?\d{4}$/.test(phoneNumber.trim())) {
          return res.status(400).json({
            message:
              "Invalid phone number format. Please use Nigerian format: +234 123 456 7890",
          });
        }
        updates.phoneNumber = phoneNumber.trim();
      }
    }

    // Handle address update
    if (address !== undefined) {
      if (address === null || Object.keys(address || {}).length === 0) {
        updates.address = null;
      } else {
        // Validate and clean address fields
        const cleanAddress = {};
        const addressFields = ["street", "state", "country"];

        addressFields.forEach((field) => {
          if (address[field] && typeof address[field] === "string") {
            cleanAddress[field] = address[field].trim();
          }
        });

        updates.address =
          Object.keys(cleanAddress).length > 0 ? cleanAddress : null;
      }
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
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred: " + error.message,
    });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Current password and new password are required",
    });
  }

  // Password validation for new password
  const errors = [];
  if (newPassword.length < 8) errors.push("at least 8 characters");
  if (!/[0-9]/.test(newPassword)) errors.push("a number");
  if (!/[A-Z]/.test(newPassword)) errors.push("an uppercase letter");
  if (!/[a-z]/.test(newPassword)) errors.push("a lowercase letter");
  if (!/[!@#$%^&*]/.test(newPassword)) errors.push("a special character");

  if (errors.length) {
    return res.status(400).json({
      message: "New password must contain: " + errors.join(", "),
    });
  }

  try {
    // Get the current user
    const user = await userCollection.findOne({
      _id: new ObjectId(req.user.id),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify current password
    const validCurrentPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!validCurrentPassword) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    //Check if new password is different from current password
    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    const updateResult = await userCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { password: hashedNewPassword } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({
        message: "Failed to update password",
      });
    }

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      message: "An error occurred while changing password",
      error: error.message,
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
    TrouserWaist,
    ThighWidth,
    KneeWidth,
    AnkleWidth,
    ShirtLength,
    SuitChest,
    SuitWaist,
    unit,
    agbadaLength,
    waistCoatLength,
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
      TrouserWaist,
      ThighWidth,
      KneeWidth,
      AnkleWidth,
      ShirtLength,
      SuitChest,
      SuitWaist,
      unit,
      agbadaLength,
      waistCoatLength,
    };

    // Validate measurement data
    const validation = validateMeasurement(measurementData);
    if (!validation.isValid) {
      console.log("validation errors:", validation.errors);
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
      console.log("Updating existing measurements for userId:", userId);
      console.log("Existing measurement:", existingMeasurement);

      const preparedData = prepareMeasurementData(measurementData);
      console.log("Prepared data for update:", preparedData);

      const result = await measurementsCollection.updateOne(
        { userId },
        { $set: preparedData }
      );

      console.log("Update result:", result);
      console.log("Modified count:", result.modifiedCount);
      console.log("Matched count:", result.matchedCount);

      if (result.modifiedCount === 0) {
        console.log("Warning: No documents were modified during update");
        // Let's also check what the document looks like after the attempted update
        const afterUpdate = await measurementsCollection.findOne({ userId });
        console.log("Document after update attempt:", afterUpdate);

        return res.status(500).json({
          message: "Failed to update measurements",
        });
      }

      // Verify the update by fetching the document again
      const updatedDocument = await measurementsCollection.findOne({ userId });
      console.log("Document after successful update:", updatedDocument);

      return res.json({
        message: "Measurements updated successfully",
      });
    } else {
      // Create new measurements
      const preparedData = prepareMeasurementData(measurementData);

      console.log(
        "Prepared data for MongoDB:",
        JSON.stringify(preparedData, null, 2)
      );

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

    // Enhanced error logging for validation failures
    if (error.code === 121) {
      // MongoDB validation error
      console.error("MongoDB Validation Error Details:");
      console.error("Error Info:", JSON.stringify(error.errInfo, null, 2));
      if (error.errInfo && error.errInfo.details) {
        console.error(
          "Validation Details:",
          JSON.stringify(error.errInfo.details, null, 2)
        );
      }
    }

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
    TrouserWaist,
    ThighWidth,
    KneeWidth,
    AnkleWidth,
    ShirtLength,
    SuitChest,
    SuitWaist,
    unit,
    agbadaLength,
    waistCoatLength,
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
      TrouserWaist,
      ThighWidth,
      KneeWidth,
      AnkleWidth,
      ShirtLength,
      SuitChest,
      SuitWaist,
      unit,
      agbadaLength,
      waistCoatLength,
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
    const userId = new ObjectId(req.user.id);
    const { paymentStatus, status, page = 1, limit = 10 } = req.query;

    // Build query filter
    const query = { userId };

    // Add payment status filter if provided
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Add order status filter if provided
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch orders with filters and pagination
    const orders = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count for pagination
    const totalCount = await ordersCollection.countDocuments(query);

    // Always return success with orders array (empty if no orders found)
    res.json({
      success: true,
      data: orders || [],
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + orders.length < totalCount,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
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

  // If no uniqueString, this is the manual verification page
  if (!uniqueString) {
    return res.json({
      status: "info",
      message: "Email verification page",
      instructions:
        "Please enter your email below to resend verification link or check your email for the verification link.",
      canResendVerification: true,
    });
  }

  try {
    // Find the verification record
    const verification = await userVerificationsCollection.findOne({
      uniqueString,
    });

    if (!verification) {
      // Redirect to frontend with error parameters
      return res.redirect(
        `${process.env.CLIENT_URL}/verify-email?status=error&message=invalid_link`
      );
    }

    // Check if token has expired (24 hours)
    const now = new Date();
    if (now > verification.expiresAt) {
      // Clean up expired token
      await userVerificationsCollection.deleteOne({ uniqueString });
      return res.redirect(
        `${process.env.CLIENT_URL}/verify-email?status=error&message=expired`
      );
    }

    // Find and update the user by email
    const user = await userCollection.findOneAndUpdate(
      { email: verification.email },
      { $set: { isVerified: true } },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/verify-email?status=error&message=user_not_found`
      );
    }

    // Clean up the verification record
    await userVerificationsCollection.deleteOne({ uniqueString });

    // Redirect to frontend with success
    return res.redirect(
      `${process.env.CLIENT_URL}/verify-email?status=success&message=verified&redirect=login`
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return res.redirect(
      `${process.env.CLIENT_URL}/verify-email?status=error&message=server_error`
    );
  }
};

const resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: "error",
      message: "Email is required",
    });
  }

  try {
    // Check if user exists
    const user = await userCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    // Delete any existing verification tokens for this email
    await userVerificationsCollection.deleteMany({
      email: email.toLowerCase(),
    });

    // Create new verification token
    const uniqueString = uuidv4();
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const verificationLink = `${process.env.API_URL}/api/users/verify-email/${uniqueString}`;

    // Prepare verification data
    const verificationData = {
      email: email.toLowerCase(),
      uniqueString,
      createdAt,
      expiresAt,
      type: "email_verification",
    };

    // Validate the data
    const validation = validateUserVerification(verificationData);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Verification data validation failed",
        errors: validation.errors,
      });
    }

    // Save verification record
    const preparedData = prepareUserVerificationData(verificationData);
    const result = await userVerificationsCollection.insertOne(preparedData);

    if (!result.insertedId) {
      return res.status(500).json({
        message: "Failed to create verification request",
      });
    }

    // Send verification email
    const subject = "Verify Your Email Address - FashionSmith";
    const html = emailTemplates.verificationEmail(
      user.firstName || user.username,
      verificationLink
    );

    await sendEmail(email.toLowerCase(), subject, html);

    res.json({
      message: "Verification email sent successfully",
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error("Error resending verification:", error.message, error.stack);
    res.status(500).json({
      message: "Failed to resend verification email",
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
  changePassword,
  addMeasurement,
  displayMeasurement,
  updateMeasurement,
  removeMeasurement,
  createOrder,
  updateOrder,
  showOrder,
  removeOrder,
  getUser,
  authCheck,
  forgotPassword,
  resetPasswordGet,
  resetPasswordPost,
  emailVerification,
  resendVerification,
};
export default users;
