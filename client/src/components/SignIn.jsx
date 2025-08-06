import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
} from "@phosphor-icons/react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useSignIn from "../hooks/useSignIn";

export default function SignIn() {
  const navigate = useNavigate();

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
      // Redirect to dashboard or specified location
      if (data.redirectTo) {
        navigate(data.redirectTo);
      } else {
        navigate("/dashboard");
      }

      // Reset the form after successful submission
      resetForm();
    }
  }, [isSuccess, data, navigate, resetForm]);

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
            <button className="btn btn-outline btn-sm w-full">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm">Continue with Google</span>
            </button>

            <button className="btn btn-outline btn-sm w-full">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm">Continue with Facebook</span>
            </button>
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
