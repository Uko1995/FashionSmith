import { useState, useCallback } from "react";
import { paymentAPI } from "../services/api.js";
import toast from "react-hot-toast";

export const usePaystack = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  // Initialize payment with Paystack
  const initializePayment = useCallback(async (paymentDetails) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentAPI.initializePayment(paymentDetails);

      if (response.data.success) {
        setPaymentData(response.data.data);
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Payment initialization failed"
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Payment initialization failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify payment after user completes payment
  const verifyPayment = useCallback(async (reference) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentAPI.verifyPayment(reference);

      if (response.data.success) {
        toast.success("Payment verified successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Payment verification failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Payment verification failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Open Paystack payment popup
  const openPaystackPopup = useCallback(
    (authorizationUrl, onSuccess, onCancel, onError) => {
      if (!authorizationUrl) {
        toast.error("Invalid payment URL");
        return;
      }

      // Open payment popup
      const popup = window.open(
        authorizationUrl,
        "paystack-payment",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        toast.error("Popup blocked. Please allow popups for this site.");
        return;
      }

      // Monitor popup for closure
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Give a brief moment for any final redirects
          setTimeout(() => {
            if (onCancel) onCancel();
          }, 1000);
        }
      }, 1000);

      // Listen for message from popup (if using postMessage)
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "PAYSTACK_PAYMENT_SUCCESS") {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener("message", handleMessage);
          if (onSuccess) onSuccess(event.data.reference);
        } else if (event.data.type === "PAYSTACK_PAYMENT_ERROR") {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener("message", handleMessage);
          if (onError) onError(event.data.error);
        }
      };

      window.addEventListener("message", handleMessage);
    },
    []
  );

  // Complete payment flow (initialize + open popup + verify)
  const processPayment = useCallback(
    async (paymentDetails, callbacks = {}) => {
      const { onSuccess, onCancel, onError } = callbacks;

      try {
        // Step 1: Initialize payment
        toast.loading("Initializing payment...", { id: "payment-process" });
        const paymentData = await initializePayment(paymentDetails);

        toast.loading("Opening payment window...", { id: "payment-process" });

        // Step 2: Open Paystack popup
        openPaystackPopup(
          paymentData.authorizationUrl,
          // On success - verify payment
          async (reference) => {
            toast.loading("Verifying payment...", { id: "payment-process" });
            try {
              const verificationData = await verifyPayment(
                reference || paymentData.reference
              );
              toast.success("Payment completed successfully!", {
                id: "payment-process",
              });
              if (onSuccess) onSuccess(verificationData);
            } catch (verifyError) {
              toast.error("Payment verification failed", {
                id: "payment-process",
              });
              if (onError) onError(verifyError);
            }
          },
          // On cancel
          () => {
            toast.error("Payment cancelled", { id: "payment-process" });
            if (onCancel) onCancel();
          },
          // On error
          (error) => {
            toast.error("Payment failed", { id: "payment-process" });
            if (onError) onError(error);
          }
        );
      } catch (err) {
        toast.error("Failed to initialize payment", { id: "payment-process" });
        if (onError) onError(err);
      }
    },
    [initializePayment, openPaystackPopup, verifyPayment]
  );

  // Format amount to Naira
  const formatAmount = useCallback((amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  // Validate payment amount
  const validateAmount = useCallback((amount) => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: "Invalid amount" };
    }

    if (numAmount < 100) {
      return { valid: false, error: "Amount must be at least ₦100" };
    }

    if (numAmount > 5000000) {
      return { valid: false, error: "Amount cannot exceed ₦5,000,000" };
    }

    return { valid: true };
  }, []);

  return {
    // State
    isLoading,
    paymentData,
    error,

    // Methods
    initializePayment,
    verifyPayment,
    openPaystackPopup,
    processPayment,

    // Utilities
    formatAmount,
    validateAmount,

    // Reset state
    clearError: () => setError(null),
    clearPaymentData: () => setPaymentData(null),
  };
};
