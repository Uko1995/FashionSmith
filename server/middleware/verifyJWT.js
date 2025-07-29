import jwt from "jsonwebtoken";
import { collections } from "../config/db.js";
import { ObjectId } from "mongodb";

const verifyJWT = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token required"
      });
    }

    // Verify the token
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
    // Get user from database to ensure they still exist and get current role
    const user = await collections.users.findOne({ 
      _id: new ObjectId(decoded.id) 
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Add user info to request object
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.username
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Access token expired"
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: "Invalid access token"
      });
    } else {
      console.error('JWT verification error:', error);
      return res.status(500).json({
        success: false,
        message: "Token verification failed"
      });
    }
  }
};

export { verifyJWT };
