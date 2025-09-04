import passport from "../config/passport.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenGenerator.js";
import { collections } from "../config/db.js";

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = (req, res) => {
  passport.authenticate("google", { session: false }, async (err, user) => {
    if (err) {
      console.error("Google auth callback error:", err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    try {
      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Update user with refresh token
      await collections.users.updateOne(
        { _id: user._id },
        { $set: { refreshToken, updatedAt: new Date() } }
      );

      // Set HTTP-only cookies
      const isProduction = process.env.NODE_ENV === "production";
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: isProduction ? undefined : undefined, // Let browser set domain
      });

      // Redirect to frontend with access token
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&success=true`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Token generation error:", error);
      res.redirect(
        `${process.env.CLIENT_URL}/login?error=token_generation_failed`
      );
    }
  })(req, res);
};

export const logout = async (req, res) => {
  try {
    // Clear refresh token from database
    if (req.user?.id) {
      await collections.users.updateOne(
        { _id: req.user.id },
        { $unset: { refreshToken: 1 }, $set: { updatedAt: new Date() } }
      );
    }

    // Clear cookies
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      domain: isProduction ? undefined : undefined,
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await collections.users.findOne(
      { _id: req.user.id },
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

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
      error: error.message,
    });
  }
};
