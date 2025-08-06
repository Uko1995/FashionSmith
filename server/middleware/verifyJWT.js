import jwt from "jsonwebtoken";
import { collections } from "../config/db.js";
import { ObjectId } from "mongodb";

const verifyJWT = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    console.log("[verifyJWT] Cookies:", req.cookies);
    if (!accessToken) {
      console.log("[verifyJWT] No accessToken cookie found. Returning 401.");
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      console.log("[verifyJWT] JWT verification error:", err);
      throw err;
    }

    // Get user from database to ensure they still exist and get current role
    const user = await collections.users.findOne({
      _id: new ObjectId(decoded.id),
    });
    if (!user) {
      console.log("[verifyJWT] No user found for decoded id. Returning 401.");
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Add user info to request object
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        success: false,
        message: "Invalid access token",
      });
    } else {
      console.error("JWT verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Token verification failed",
      });
    }
  }
};

export { verifyJWT };
