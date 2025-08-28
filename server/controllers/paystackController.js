import { ObjectId } from "mongodb";
import { collections } from "../config/db.js";
import {
  validatePayment,
  preparePaymentData,
  nairaToKobo,
  koboToNaira,
  paymentStatuses,
} from "../models/paystackPayment.js";
import {
  validateAmount,
  calculatePaystackFee,
  generateReference,
  isHighValueTransaction,
  paymentConfig,
} from "../config/payment.js";
import crypto from "crypto";

// Initialize Paystack payment (Step 1: Create payment intent)
export const initializePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      orderId,
      amount, // Amount in Naira
      customerEmail,
      callbackUrl,
      metadata = {},
    } = req.body;

    // Validate required fields
    if (!orderId || !amount || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Order ID, amount, and customer email are required",
      });
    }

    // Validate amount
    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) {
      return res.status(400).json({
        success: false,
        message: amountValidation.error,
      });
    }

    // Verify order exists and belongs to user
    const order = await collections.orders.findOne({
      _id: new ObjectId(orderId),
      userId: new ObjectId(userId),
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order already has a successful payment
    const existingPayment = await collections.payments.findOne({
      orderId: new ObjectId(orderId),
      status: "success",
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Order has already been paid",
      });
    }

    // Convert amount to kobo and calculate fees
    const amountInKobo = nairaToKobo(amount);
    const feeCalculation = calculatePaystackFee(amount);

    // Generate unique reference
    const reference = generateReference();

    // Prepare payment data
    const paymentData = {
      userId: new ObjectId(userId),
      orderId: new ObjectId(orderId),
      amount: amountInKobo,
      currency: "NGN",
      reference,
      status: "pending",
      customerEmail,
      fees: {
        paystack: nairaToKobo(feeCalculation.fee),
        total: nairaToKobo(feeCalculation.total),
      },
      metadata: {
        ...metadata,
        orderNumber: order.orderNumber,
        customerName: req.user.firstName + " " + req.user.lastName,
        orderTotal: order.totalCost,
        userAgent: req.headers["user-agent"],
        highValue: isHighValueTransaction(amount),
      },
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    // Validate payment data
    const validation = validatePayment(paymentData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment data",
        errors: validation.errors,
      });
    }

    // Prepare data for insertion
    const preparedData = preparePaymentData(paymentData);

    // Insert payment record
    const result = await collections.payments.insertOne(preparedData);

    if (!result.insertedId) {
      return res.status(500).json({
        success: false,
        message: "Failed to create payment record",
      });
    }

    // Initialize Paystack payment
    try {
      const paystackResponse = await initializePaystackPayment({
        email: customerEmail,
        amount: amountInKobo,
        reference,
        callback_url: callbackUrl,
        metadata: paymentData.metadata,
      });

      if (!paystackResponse.status) {
        console.error("Paystack initialization failed:", paystackResponse);
        throw new Error(
          paystackResponse.message || "Paystack initialization failed"
        );
      }

      console.log("Paystack response data:", paystackResponse.data);

      // Update payment record with Paystack details
      await collections.payments.updateOne(
        { _id: result.insertedId },
        {
          $set: {
            paystackReference: paystackResponse.data.reference,
            authorizationUrl: paystackResponse.data.authorization_url,
            accessCode: paystackResponse.data.access_code,
            updatedAt: new Date(),
          },
        }
      );

      // Return payment initialization data
      const responseData = {
        paymentId: result.insertedId,
        reference,
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        amount: koboToNaira(amountInKobo),
        fees: {
          paystack: koboToNaira(paymentData.fees.paystack),
          total: koboToNaira(paymentData.fees.total),
        },
      };

      console.log("Sending response data:", responseData);

      res.status(201).json({
        success: true,
        message: "Payment initialized successfully",
        data: responseData,
      });
    } catch (paystackError) {
      // Update payment status to failed
      await collections.payments.updateOne(
        { _id: result.insertedId },
        {
          $set: {
            status: "failed",
            failureReason: paystackError.message,
            updatedAt: new Date(),
          },
        }
      );

      console.error("Paystack initialization error:", paystackError);
      res.status(500).json({
        success: false,
        message: "Failed to initialize payment with Paystack",
        error:
          process.env.NODE_ENV === "development"
            ? paystackError.message
            : undefined,
      });
    }
  } catch (error) {
    console.error("Error initializing payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Verify payment (Step 2: Verify after user completes payment)
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Find payment record
    const payment = await collections.payments.findOne({
      reference,
      userId: new ObjectId(req.user.id),
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Verify with Paystack
    try {
      const verificationResponse = await verifyPaystackPayment(reference);
      console.log("payment verification response: ", verificationResponse);

      if (!verificationResponse.status) {
        throw new Error(
          verificationResponse.message || "Payment verification failed"
        );
      }

      const paystackData = verificationResponse.data;

      // Update payment record based on Paystack response
      const updateData = {
        status: paystackData.status === "success" ? "success" : "failed",
        channel: paystackData.channel,
        paidAt:
          paystackData.status === "success"
            ? new Date(paystackData.paid_at)
            : null,
        paystackReference: paystackData.reference,
        updatedAt: new Date(),
        metadata: {
          ...payment.metadata,
          paystackResponse: {
            gateway_response: paystackData.gateway_response,
            channel: paystackData.channel,
            fees: koboToNaira(paystackData.fees),
            authorization: paystackData.authorization,
          },
        },
      };

      if (paystackData.status !== "success") {
        updateData.failureReason =
          paystackData.gateway_response || "Payment failed";
      }

      await collections.payments.updateOne(
        { _id: payment._id },
        { $set: updateData }
      );

      // If payment successful, update order status
      if (paystackData.status === "success") {
        // Update the corresponding order document to reflect successful payment
        await collections.orders.updateOne(
          { _id: payment.orderId },
          {
            $set: {
              status: "In Progress",
              paymentStatus: "Paid",
              paidAt: new Date(),
              updatedAt: new Date(),
            },
          }
        );

        res.json({
          success: true,
          message: "Payment verified successfully",
          data: {
            reference: payment.reference,
            amount: koboToNaira(payment.amount),
            status: "success",
            paidAt: updateData.paidAt,
            channel: paystackData.channel,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Payment verification failed",
          data: {
            reference: payment.reference,
            status: paystackData.status,
            reason: updateData.failureReason,
          },
        });
      }
    } catch (verificationError) {
      console.error("Payment verification error:", verificationError);

      // Update payment status to failed
      await collections.payments.updateOne(
        { _id: payment._id },
        {
          $set: {
            status: "failed",
            failureReason: verificationError.message,
            updatedAt: new Date(),
          },
        }
      );

      res.status(500).json({
        success: false,
        message: "Failed to verify payment",
        error:
          process.env.NODE_ENV === "development"
            ? verificationError.message
            : undefined,
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user's payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      orderId,
      startDate,
      endDate,
    } = req.query;

    // Build query
    const query = { userId: new ObjectId(userId) };

    if (status) query.status = status;
    if (orderId) query.orderId = new ObjectId(orderId);

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get payments with order details
    const payments = await collections.payments
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "order",
          },
        },
        { $unwind: "$order" },
        {
          $project: {
            _id: 1,
            reference: 1,
            amount: 1,
            currency: 1,
            status: 1,
            channel: 1,
            fees: 1,
            paidAt: 1,
            createdAt: 1,
            "order.orderNumber": 1,
            "order.items": 1,
            "order.totalAmount": 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
      ])
      .toArray();

    // Convert amounts from kobo to naira
    const formattedPayments = payments.map((payment) => ({
      ...payment,
      amount: koboToNaira(payment.amount),
      fees: payment.fees
        ? {
            paystack: koboToNaira(payment.fees.paystack || 0),
            total: koboToNaira(payment.fees.total || 0),
          }
        : null,
    }));

    // Get total count
    const totalCount = await collections.payments.countDocuments(query);

    res.json({
      success: true,
      data: formattedPayments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + payments.length < totalCount,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await collections.payments
      .aggregate([
        {
          $match: {
            _id: new ObjectId(paymentId),
            userId: new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "order",
          },
        },
        { $unwind: "$order" },
      ])
      .toArray();

    if (!payment.length) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const paymentData = payment[0];

    // Format amounts
    const formattedPayment = {
      ...paymentData,
      amount: koboToNaira(paymentData.amount),
      fees: paymentData.fees
        ? {
            paystack: koboToNaira(paymentData.fees.paystack || 0),
            total: koboToNaira(paymentData.fees.total || 0),
          }
        : null,
    };

    res.json({
      success: true,
      data: formattedPayment,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Webhook handler for Paystack events
export const handlePaystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers["x-paystack-signature"];
    const body = JSON.stringify(req.body);

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const { event, data } = req.body;

    const db = getDB();

    switch (event) {
      case "charge.success":
        await handleChargeSuccess(db, data);
        break;
      case "charge.failed":
        await handleChargeFailed(db, data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

// Helper functions for Paystack API calls
const initializePaystackPayment = async (paymentData) => {
  // Debug logging
  console.log(
    "Paystack Secret Key:",
    paymentConfig.paystack.secretKey ? "✓ Present" : "✗ Missing"
  );
  console.log("Paystack Enabled:", paymentConfig.paystack.enabled);

  if (!paymentConfig.paystack.secretKey) {
    throw new Error(
      "Paystack secret key is not configured. Please set PAYSTACK_SECRET_KEY in environment variables."
    );
  }

  const response = await fetch(
    `${paymentConfig.paystack.baseUrl}/transaction/initialize`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paymentConfig.paystack.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Paystack API Error:", result);
    throw new Error(result.message || "Paystack API request failed");
  }

  return result;
};

const verifyPaystackPayment = async (reference) => {
  const response = await fetch(
    `${paymentConfig.paystack.baseUrl}/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paymentConfig.paystack.secretKey}`,
      },
    }
  );

  return await response.json();
};

// Webhook event handlers
const handleChargeSuccess = async (db, data) => {
  await collections.payments.updateOne(
    { reference: data.reference },
    {
      $set: {
        status: "success",
        paidAt: new Date(data.paid_at),
        channel: data.channel,
        paystackReference: data.reference,
        updatedAt: new Date(),
        metadata: {
          $mergeObjects: ["$metadata", { webhookData: data }],
        },
      },
    }
  );

  // Update order status
  const payment = await collections.payments.findOne({
    reference: data.reference,
  });
  if (payment) {
    await collections.orders.updateOne(
      { _id: payment.orderId },
      {
        $set: {
          status: "paid",
          paymentStatus: "completed",
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
  }
};

const handleChargeFailed = async (db, data) => {
  await collections.payments.updateOne(
    { reference: data.reference },
    {
      $set: {
        status: "failed",
        failureReason: data.gateway_response || "Payment failed",
        channel: data.channel,
        updatedAt: new Date(),
        metadata: {
          $mergeObjects: ["$metadata", { webhookData: data }],
        },
      },
    }
  );
};
