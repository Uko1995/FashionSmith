import { useEffect, useState } from "react";

// Debug: Log when component loads
console.log("PaymentSuccess component loaded");
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userAPI } from "../services/api";

export default function PaymentSuccess() {
  // Local error boundary for debugging
  const [localError, setLocalError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [paymentDetails, setPaymentDetails] = useState(null);

  const reference = searchParams.get("reference");
  console.log("reference:", reference); // Debug log

  useEffect(() => {
    if (!reference) {
      setVerificationStatus("error");
      toast.error("Missing payment reference");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await userAPI.verifyPayment(reference);
        console.log("Payment verification response:", response.data.data); // Debug log

        if (response?.data.success) {
          setVerificationStatus("success");
          setPaymentDetails(response?.data);
          toast.success("Payment verified successfully!");
        } else {
          setVerificationStatus("failed");
          toast.error(response.data.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setVerificationStatus("error");

        if (error.response?.status === 404) {
          toast.error("Payment reference not found. Please contact support.");
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Error verifying payment. Please contact support.");
        }
      }
    };

    verifyPayment();
  }, [reference]);

  const handleContinueToOrders = () => {
    navigate("/profile?tab=orders");
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  if (localError) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-error">
            Component Error
          </h2>
          <pre className="text-error-content bg-base-200 p-4 rounded-xl overflow-x-auto">
            {localError.toString()}
          </pre>
        </div>
      </div>
    );
  }

  if (verificationStatus === "verifying") {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <CircleNotchIcon
            size={48}
            className="animate-spin text-primary mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
          <p className="text-base-content/70">
            Please wait while we confirm your payment...
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-base-200 rounded-3xl p-8 text-center">
            <CheckCircleIcon size={64} className="text-success mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-success mb-2">
              Payment Successful!
            </h1>
            <p className="text-base-content/70 mb-6">
              Your order has been confirmed and payment processed successfully.
            </p>

            {paymentDetails && (
              <div className="bg-base-100 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Reference:</span>
                    <span className="font-mono">
                      {paymentDetails?.data?.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>
                      ₦{paymentDetails?.data?.amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid with:</span>
                    <span className="text-success font-medium">
                      {paymentDetails?.data?.channel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-success font-medium">
                      {paymentDetails?.data?.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleContinueToOrders}
                className="btn btn-primary w-full"
              >
                View My Orders
              </button>
              <button
                onClick={handleReturnHome}
                className="btn btn-ghost w-full"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or failed state
  return (
    <ErrorBoundary setLocalError={setLocalError}>
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-base-200 rounded-3xl p-8 text-center">
            <XCircleIcon size={64} className="text-error mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-error mb-2">
              {verificationStatus === "failed"
                ? "Payment Failed"
                : "Verification Error"}
            </h1>
            <p className="text-base-content/70 mb-6">
              {verificationStatus === "failed"
                ? "Your payment could not be processed. Please try again."
                : "We couldn't verify your payment. Please contact support if money was deducted."}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/gallery")}
                className="btn btn-primary w-full"
              >
                Return to Store
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="btn btn-ghost w-full"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Simple error boundary for debugging
function ErrorBoundary({ children, setLocalError }) {
  try {
    return children;
  } catch (err) {
    setLocalError(err);
    return null;
  }
}
