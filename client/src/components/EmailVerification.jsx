import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/axiosConfig";

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { uniqueString } = useParams();
  const nextStep = location.state?.nextStep;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

  // Handle query parameters for status messages
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const status = urlParams.get('status');
    const message = urlParams.get('message');
    const verified = urlParams.get('verified');

    if (status === 'success' && message === 'verified') {
      toast.success("Email verified successfully!");
      setShowCountdown(true);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/login?verified=true");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (verified === 'true') {
      toast.success("Email verified successfully! Please log in.");
    } else if (status === 'error') {
      switch (message) {
        case 'invalid_link':
          toast.error("Invalid verification link. Please request a new one.");
          break;
        case 'expired':
          toast.error("Verification link expired. Please request a new one.");
          break;
        case 'user_not_found':
          toast.error("User not found. Please sign up again.");
          break;
        case 'server_error':
          toast.error("Server error. Please try again.");
          break;
        default:
          toast.error("Verification failed. Please try again.");
      }
    }
  }, [location.search, navigate]);

  // If there's a uniqueString in URL, show loading/processing state
  // (Note: The actual verification happens on the backend and redirects back)
  useEffect(() => {
    if (uniqueString) {
      // This would normally be handled by the backend redirect,
      // but we can show a loading state in case user lands here
      const timer = setTimeout(() => {
        navigate("/login", {
          state: { nextStep: "Please log in to continue" },
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [uniqueString, navigate]);

  const handleResendEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/api/users/resend-verification', 
        { email },
        { withCredentials: true }
      );
      console.log("Success:", res.data);
      toast.success("Verification email sent successfully!");
      setEmail(""); // Clear the input
    } catch (error) {
      console.error(
        "Error resending verification email:",
        error.response ? error.response.data : error.message
      );
      toast.error(
        error.response?.data?.message || "Failed to resend verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleResendEmail();
  };

  const handleManualRedirect = () => {
    navigate("/login?verified=true");
  };

  // Success state with countdown
  if (showCountdown) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-base-100">
        <div className="card w-96 bg-base-100 shadow-xl border border-success/20">
          <div className="card-body text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="card-title text-success text-2xl justify-center">
              Email Verified Successfully!
            </h1>
            <p className="text-lg">
              Welcome to FashionSmith! Your email address has been verified.
            </p>
            <p className="text-base text-base-content/70">
              You can now log in to your account and start using our services.
            </p>
            
            <div className="mt-6 p-4 bg-success/10 rounded-lg">
              <div className="text-lg font-semibold">
                Redirecting to login page in{" "}
                <span className="text-success text-xl">{countdown}</span> seconds...
              </div>
              <progress 
                className="progress progress-success w-full mt-2" 
                value={3 - countdown} 
                max="3"
              ></progress>
            </div>

            <div className="card-actions justify-center mt-4">
              <button 
                onClick={handleManualRedirect}
                className="btn btn-success"
              >
                Continue to Login Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-base-100">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl justify-center">Verify your email</h1>

          {uniqueString ? (
            <div className="text-center space-y-4">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-lg">Processing email verification...</p>
              <p className="text-sm text-base-content/60">
                If you're not redirected automatically, please check your email for further instructions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-base">
                  {nextStep || "Enter your email to get a new verification link."}
                </p>
                <p className="text-sm text-base-content/60">
                  Please check your spam folder if you didn't receive it.
                </p>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input input-bordered w-full"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </button>
              </div>

              <div className="divider">OR</div>

              <div className="text-center">
                <p className="text-sm text-base-content/60">
                  Already verified?{" "}
                  <a href="/login" className="link link-primary font-semibold">
                    Log in here
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
