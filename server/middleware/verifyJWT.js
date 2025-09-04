import jwt from "jsonwebtoken";
import { collections } from "../config/db.js";
import { ObjectId } from "mongodb";

const verifyJWT = async (req, res, next) => {
  try {
    let accessToken;

    // Add debugging for cookies and headers
    console.log("[JWT MIDDLEWARE] === Authentication Debug ===");
    console.log("[JWT MIDDLEWARE] Cookies received:", req.cookies);
    console.log(
      "[JWT MIDDLEWARE] Authorization header:",
      req.headers.authorization
    );
    console.log("[JWT MIDDLEWARE] Request URL:", req.url);

    // Check for JWT token in Authorization header (Google OAuth)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log(
        "[JWT MIDDLEWARE] Using Bearer token from Authorization header"
      );
    } else {
      // Check for JWT token in cookies (regular users)
      accessToken = req.cookies.accessToken;
      console.log(
        "[JWT MIDDLEWARE] Using token from cookies:",
        accessToken ? "Found" : "Not found"
      );
    }

    if (!accessToken) {
      console.log("[JWT MIDDLEWARE] No access token found - returning 401");
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
      throw err;
    }

    // Get user from database to ensure they still exist and get current role
    const user = await collections.users.findOne({
      _id: new ObjectId(decoded.id),
    });
    if (!user) {
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
