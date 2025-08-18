import express from "express";
import {
  createPayment,
  processPayment,
  getUserPayments,
  getPaymentDetails,
  refundPayment,
  getPaymentAnalytics,
} from "../controllers/paymentController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

// User payment routes
router.post("/", verifyJWT, createPayment);
router.post("/:paymentId/process", verifyJWT, processPayment);
router.get("/", verifyJWT, getUserPayments);
router.get("/:paymentId", verifyJWT, getPaymentDetails);

// Admin payment routes
router.post("/:paymentId/refund", verifyJWT, verifyAdmin, refundPayment);
router.get("/analytics/overview", verifyJWT, verifyAdmin, getPaymentAnalytics);

export default router;
