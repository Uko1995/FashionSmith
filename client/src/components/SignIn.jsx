import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
} from "@phosphor-icons/react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useForm } from "react-hook-form";
import useSignIn from "../hooks/useSignIn";
import RedAsterix from "./RedAsterix";
import GoogleLoginButton from "./GoogleLoginButton";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize React Hook Form with validation rules
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    setError,
    clearErrors,
    reset: resetForm,
  } = useForm({
    mode: "onChange", // Validate on change for real-time feedback
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Initialize TanStack Query mutation hook for signin
  const {
    signIn,
    isLoading,
    isError,
    error,
    isSuccess,
    data,
    reset: resetMutation,
  } = useSignIn();

  // Local state for UI interactions
  const [showPassword, setShowPassword] = useState(false);

  // Effect: Handle successful signin
  useEffect(() => {
    if (isSuccess && data) {
      // Get the intended destination from location state (set by ProtectedRoute)
      const from = location.state?.from?.pathname || "/";

      // Redirect to intended destination or dashboard
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(data.redirectTo);
      }

      // Reset the form after successful submission
      resetForm();
    }
  }, [isSuccess, data, navigate, resetForm, location.state]);

  // Effect: Handle signin errors
  useEffect(() => {
    if (isError && error) {
      const errorMessage = error.response?.data?.message || error.message;
      const errorCode = error.response?.data?.code;
      const userEmail = error.response?.data?.email;

      // Handle email verification redirect
      if (errorCode === "EMAIL_NOT_VERIFIED") {
        navigate("/verify-email", {
          state: {
            email: userEmail,
            fromLogin: true,
          },
        });
        return;
      }

      // Handle other specific error types
      if (
        errorMessage?.includes("Invalid credentials") ||
        errorMessage?.includes("User not found") ||
        errorMessage?.includes("incorrect password")
      ) {
        setError("root.serverError", {
          type: "server",
          message: "Invalid email or password",
        });
      } else if (errorMessage?.includes("Account locked")) {
        setError("root.serverError", {
          type: "server",
          message: "Account temporarily locked. Please try again later",
        });
      } else {
        // Handle general server errors
        setError("root.serverError", {
          type: "server",
          message: errorMessage || "Login failed. Please try again.",
        });
      }
    }
  }, [isError, error, setError, navigate]);

  // Clear server errors when user starts typing
  const handleInputChange = () => {
    if (isError) {
      clearErrors("root.serverError");
      resetMutation();
    }
  };

  // Form submission handler using React Hook Form
  const onSubmit = (formData) => {
    // Prevent duplicate submissions
    if (isLoading) return;

    // Clear any previous errors
    clearErrors();

    // Prepare login data for API
    const loginData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    // Call the mutation from useSignIn hook
    signIn(loginData);
  };

  return (
    <div className="min-h-screen w-full -mt-5 flex items-center justify-center p-3">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body p-6">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="card-title text-xl font-bold justify-center mb-1">
              Welcome Back
            </h2>
            <p className="text-base-content/70 text-sm">
              Sign in to your FashionSmith account
            </p>
          </div>

          {/* General Error - Display server errors */}
          {formErrors?.root?.serverError && (
            <div className="alert alert-error mb-4 py-2">
              <span className="text-sm">
                {formErrors.root.serverError.message}
              </span>
            </div>
          )}

          {/* Form with React Hook Form integration */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email with React Hook Form validation */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">
                  Email Address
                </span>
                <RedAsterix />
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  type="email"
                  className={`input input-bordered input-sm w-full pl-10 ${
                    formErrors.email ? "input-error" : ""
                  }`}
                  placeholder="Enter your email"
                  onChange={handleInputChange} // Clear server errors on input
                />
              </div>
              {formErrors.email && (
                <label className="label py-1">
                  <span className="label-text-alt text-error text-xs">
                    {formErrors.email.message}
                  </span>
                </label>
              )}
            </div>

            {/* Password with React Hook Form validation */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">Password</span>
                <RedAsterix />
                <Link
                  to="/forgot-password"
                  className="label-text-alt link link-primary text-xs"
                >
                  Forgot password?
                </Link>
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 1,
                      message: "Password is required",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered input-sm w-full pl-10 pr-10 ${
                    formErrors.password ? "input-error" : ""
                  }`}
                  placeholder="Enter your password"
                  onChange={handleInputChange} // Clear server errors on input
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <label className="label py-1">
                  <span className="label-text-alt text-error text-xs">
                    {formErrors.password.message}
                  </span>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full btn-lg"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider my-4 text-xs">OR</div>

          {/* Social Login Buttons */}
          <div className="space-y-2">
            <GoogleLoginButton
              onSuccess={(user) => {
                // Handle successful Google login
                console.log("Google login success:", user);
              }}
              onError={(error) => {
                // Handle Google login error
                console.error("Google login error:", error);
                setError("root.serverError", {
                  type: "server",
                  message: "Google login failed. Please try again.",
                });
              }}
            />
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-4">
            <p className="text-base-content/70 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="link link-primary font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
