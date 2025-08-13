import express from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// All dashboard routes require authentication
router.use(verifyJWT);

// Main dashboard endpoint
router.get("/", verifyJWT, dashboardController.getUserDashboard);

// User's order history with pagination and filtering
router.get("/orders", verifyJWT, dashboardController.getUserOrders);

// User notifications/alerts
router.get(
  "/notifications",
  verifyJWT,
  dashboardController.getUserNotifications
);

export default router;
