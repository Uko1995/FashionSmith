import express from "express";
import {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  handlePaystackWebhook,
} from "../controllers/paystackController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// Payment initialization (Step 1: Create payment intent)
router.post("/initialize", verifyJWT, initializePayment);

// Payment verification (Step 2: Verify completed payment)
router.get("/verify/:reference", verifyJWT, verifyPayment);

// Get user's payment history
router.get("/history", verifyJWT, getPaymentHistory);

// Get specific payment details
router.get("/:paymentId", verifyJWT, getPaymentDetails);

// Webhook endpoint for Paystack (no auth required)
router.post("/webhook/paystack", handlePaystackWebhook);

export default router;
