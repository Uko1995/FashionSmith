import express from "express";
import users from "../controllers/userController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordReset,
  validateNewPassword,
} from "../validators/userValidators.js";

const router = express.Router();

//Public routes
router.post("/signup", validateUserRegistration, users.signUp);
router.get("/verify-email", users.emailVerification);
router.get("/verify-email/:uniqueString", users.emailVerification);
router.post("/resend-verification", users.resendVerification);
router.post("/login", validateUserLogin, users.login);
router.post("/refresh", users.refresh);
router.post("/forgotPassword", validatePasswordReset, users.forgotPassword);
router.get("/resetPassword/:uniqueString", users.resetPasswordGet);
router.post("/resetPassword", validateNewPassword, users.resetPasswordPost);

// Simple auth check endpoint - just verifies cookies
router.get("/auth-check", users.authCheck);

//Protected routes
router.post("/logout", users.logout);
router.delete("/deactivate", verifyJWT, users.removeUser);
router.get("/profile", verifyJWT, users.getUser);
router.patch(
  "/updateProfile",
  verifyJWT,
  validateUserUpdate,
  users.updateUserInfo
);

//Measurement
router.post("/addMeasurement", verifyJWT, users.addMeasurement);
router.get("/getMeasurement", verifyJWT, users.displayMeasurement);
router.patch("/updateMeasurement", verifyJWT, users.updateMeasurement);
router.delete("/removeMeasurement", verifyJWT, users.removeMeasurement);

//Orders
router.post("/newOrder", verifyJWT, users.createOrder);
router.get("/getOrder", verifyJWT, users.showOrder);
router.patch("/updateOrder", verifyJWT, users.updateOrder);
router.delete("/removeOrder/:orderId", verifyJWT, users.removeOrder);

router.delete("/removeUsers", users.deleteUsers);

export default router;
