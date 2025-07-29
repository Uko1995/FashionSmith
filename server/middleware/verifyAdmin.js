// Middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated (should be called after verifyJWT)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required. Only administrators can perform this action.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying admin access",
      error: error.message,
    });
  }
};

export default verifyAdmin;
