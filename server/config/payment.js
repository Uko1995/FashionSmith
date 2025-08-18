// Paystack-only payment configuration for FashionSmith
// Simplified configuration for Nigerian Naira transactions

export const paymentConfig = {
  // Default settings
  defaultCurrency: "NGN",
  defaultProvider: "paystack",
  
  // Paystack configuration
  paystack: {
    enabled: process.env.PAYSTACK_ENABLED !== "false", // Default to true
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    baseUrl: "https://api.paystack.co",
    currencies: ["NGN"],
    fees: {
      rate: 0.015, // 1.5%
      fixed: 100, // ₦100 for local transactions
      cap: 2000, // ₦2000 maximum fee
    },
  },
  
  // Currency configuration (NGN only)
  currency: {
    symbol: "₦",
    name: "Nigerian Naira",
    code: "NGN",
    decimalPlaces: 2,
  },
  
  // Payment methods supported by Paystack
  paymentMethods: {
    card: {
      enabled: true,
      displayName: "Credit/Debit Card",
      supportedCards: ["visa", "mastercard", "verve"],
    },
    bank: {
      enabled: true,
      displayName: "Bank Transfer",
    },
    ussd: {
      enabled: true,
      displayName: "USSD",
    },
    qr: {
      enabled: true,
      displayName: "QR Code",
    },
    mobile_money: {
      enabled: true,
      displayName: "Mobile Money",
    },
  },
  
  // Security settings
  security: {
    // Maximum transaction amount in NGN
    maxTransactionAmount: 5000000, // ₦5,000,000
    
    // Minimum transaction amount in NGN
    minTransactionAmount: 100, // ₦100
    
    // Require additional verification for high amounts
    highValueThreshold: 500000, // ₦500,000
    
    // Enable metadata for tracking
    enableMetadata: true,
    
    // Webhook verification
    verifyWebhooks: true,
  },
  
  // Webhook configuration
  webhook: {
    endpoint: "/api/webhooks/paystack",
    events: [
      "charge.success",
      "charge.failed",
      "transfer.success",
      "transfer.failed",
      "transfer.reversed",
    ],
  },
  
  // Transaction statuses
  statuses: {
    pending: "pending",
    processing: "processing", 
    success: "success",
    failed: "failed",
    abandoned: "abandoned",
    cancelled: "cancelled",
    reversed: "reversed",
  },
};

// Helper functions
export const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: "Invalid amount" };
  }
  
  if (numAmount < paymentConfig.security.minTransactionAmount) {
    return { 
      valid: false, 
      error: `Amount must be at least ₦${paymentConfig.security.minTransactionAmount}` 
    };
  }
  
  if (numAmount > paymentConfig.security.maxTransactionAmount) {
    return { 
      valid: false, 
      error: `Amount cannot exceed ₦${paymentConfig.security.maxTransactionAmount.toLocaleString()}` 
    };
  }
  
  return { valid: true };
};

export const calculatePaystackFee = (amount) => {
  const { rate, fixed, cap } = paymentConfig.paystack.fees;
  const percentageFee = amount * rate;
  const totalFee = Math.min(percentageFee + fixed, cap);
  
  return {
    fee: Math.round(totalFee * 100) / 100,
    total: amount + totalFee,
    breakdown: {
      percentage: percentageFee,
      fixed: fixed,
      capped: totalFee >= cap,
    }
  };
};

export const formatNaira = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const generateReference = (prefix = "FS") => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

export const isHighValueTransaction = (amount) => {
  return amount >= paymentConfig.security.highValueThreshold;
};

export default paymentConfig;
