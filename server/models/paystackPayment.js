// Simplified Payment schema for Paystack integration

export const paymentSchema = {
  // JSON Schema for MongoDB validation
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "userId",
        "orderId",
        "amount",
        "currency",
        "reference",
        "status",
      ],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "User ID is required",
        },
        orderId: {
          bsonType: "objectId",
          description: "Order ID is required",
        },
        amount: {
          bsonType: "number",
          minimum: 100,
          description: "Payment amount in kobo (minimum ₦1.00)",
        },
        currency: {
          bsonType: "string",
          enum: ["NGN"],
          description: "Currency code - NGN only",
        },
        reference: {
          bsonType: "string",
          description: "Unique payment reference",
        },
        status: {
          bsonType: "string",
          enum: [
            "pending",
            "processing",
            "success",
            "failed",
            "abandoned",
            "cancelled",
            "reversed",
          ],
          description: "Payment status",
        },
        paystackReference: {
          bsonType: "string",
          description: "Paystack transaction reference",
        },
        authorizationUrl: {
          bsonType: "string",
          description: "Paystack payment URL",
        },
        accessCode: {
          bsonType: "string",
          description: "Paystack access code",
        },
        channel: {
          bsonType: "string",
          enum: ["card", "bank", "ussd", "qr", "mobile_money"],
          description: "Payment channel used",
        },
        customerEmail: {
          bsonType: "string",
          description: "Customer email address",
        },
        metadata: {
          bsonType: "object",
          description: "Additional payment metadata",
        },
        fees: {
          bsonType: "object",
          properties: {
            paystack: {
              bsonType: "number",
              minimum: 0,
              description: "Paystack processing fee",
            },
            total: {
              bsonType: "number",
              minimum: 0,
              description: "Total amount including fees",
            },
          },
        },
        paidAt: {
          bsonType: "date",
          description: "When payment was completed",
        },
        failureReason: {
          bsonType: "string",
          description: "Reason for payment failure",
        },
        ipAddress: {
          bsonType: "string",
          description: "Customer IP address",
        },
        createdAt: {
          bsonType: "date",
          description: "Creation timestamp",
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp",
        },
      },
    },
  },
};

// Indexes for performance
export const paymentIndexes = [
  { key: { userId: 1 } },
  { key: { orderId: 1 } },
  { key: { reference: 1 }, unique: true },
  { key: { paystackReference: 1 }, unique: true, sparse: true },
  { key: { status: 1 } },
  { key: { createdAt: -1 } },
  { key: { customerEmail: 1 } },
];

// Default values
export const paymentDefaults = {
  currency: "NGN",
  status: "pending",
  createdAt: () => new Date(),
  updatedAt: () => new Date(),
};

// Payment statuses
export const paymentStatuses = [
  "pending",
  "processing",
  "success",
  "failed",
  "abandoned",
  "cancelled",
  "reversed",
];

// Payment channels
export const paymentChannels = ["card", "bank", "ussd", "qr", "mobile_money"];

// Validation functions
export const validatePayment = (paymentData) => {
  const errors = [];

  const requiredFields = [
    "userId",
    "orderId",
    "amount",
    "reference",
    "customerEmail",
  ];

  // Check required fields
  requiredFields.forEach((field) => {
    if (!paymentData[field]) {
      errors.push(`${field} is required`);
    }
  });

  // Validate amount (should be in kobo)
  if (
    paymentData.amount &&
    (isNaN(paymentData.amount) || paymentData.amount < 100)
  ) {
    errors.push("Amount must be at least ₦1.00 (100 kobo)");
  }

  // Validate email
  if (
    paymentData.customerEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.customerEmail)
  ) {
    errors.push("Invalid email address");
  }

  // Validate status
  if (paymentData.status && !paymentStatuses.includes(paymentData.status)) {
    errors.push(`Payment status must be one of: ${paymentStatuses.join(", ")}`);
  }

  // Validate channel
  if (paymentData.channel && !paymentChannels.includes(paymentData.channel)) {
    errors.push(
      `Payment channel must be one of: ${paymentChannels.join(", ")}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to prepare payment data for insertion
export const preparePaymentData = (paymentData) => {
  // Filter out undefined values
  const cleanedData = Object.fromEntries(
    Object.entries(paymentData).filter(([key, value]) => value !== undefined)
  );

  return {
    ...paymentDefaults,
    ...cleanedData,
    currency: "NGN", // Always NGN
    createdAt: paymentData.createdAt || new Date(),
    updatedAt: new Date(),
  };
};

// Convert Naira to Kobo (Paystack uses kobo)
export const nairaToKobo = (nairaAmount) => {
  return Math.round(parseFloat(nairaAmount) * 100);
};

// Convert Kobo to Naira
export const koboToNaira = (koboAmount) => {
  return parseFloat(koboAmount) / 100;
};
