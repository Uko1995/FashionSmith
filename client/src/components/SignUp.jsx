import {
  CheckCircleIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  UserIcon,
} from "@phosphor-icons/react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useSignUp from "../hooks/useSignUp";

export default function SignUp() {
  const navigate = useNavigate();

  // Initialize React Hook Form with validation rules
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: formErrors, isValid },
    setError,
    clearErrors,
    reset: resetForm,
  } = useForm({
    mode: "onChange", // Validate on change for real-time feedback
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Initialize TanStack Query mutation hook for signup
  const {
    signUp,
    isLoading,
    isError,
    error,
    isSuccess,
    data,
    reset: resetMutation,
  } = useSignUp();

  // Local state for UI interactions
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false,
  });

  // Watch password field for real-time strength checking
  const watchedPassword = watch("password");

  // Effect: Update password strength in real-time
  useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength({
        hasLength: watchedPassword.length >= 8,
        hasNumber: /[0-9]/.test(watchedPassword),
        hasUpper: /[A-Z]/.test(watchedPassword),
        hasLower: /[a-z]/.test(watchedPassword),
        hasSpecial: /[!@#$%^&*]/.test(watchedPassword),
      });
    }
  }, [watchedPassword]);

  // Effect: Handle successful signup
  useEffect(() => {
    if (isSuccess && data) {
      // Redirect to verification page with user email
      if (data.redirectTo) {
        navigate(data.redirectTo, {
          state: {
            email: data.user?.email,
            nextStep: data.nextStep,
            fromSignup: true,
          },
        });
      } else {
        navigate("/verify-email", {
          state: {
            email: data.user?.email,
            nextStep: data.nextStep,
            fromSignup: true,
          },
        });
      }

      // Reset the form after successful submission
      resetForm();
    }
  }, [isSuccess, data, navigate, resetForm]);

  // Effect: Handle signup errors
  useEffect(() => {
    if (isError && error) {
      const errorMessage = error.response?.data?.message || error.message;

      // Handle specific error types
      if (
        errorMessage?.includes("User already exists") ||
        errorMessage?.includes("email already exists")
      ) {
        setError("email", {
          type: "server",
          message: "An account with this email already exists",
        });
      } else if (errorMessage?.includes("validation")) {
        // Handle validation errors from server
        setError("root.serverError", {
          type: "server",
          message: errorMessage,
        });
      } else {
        // Handle general server errors
        setError("root.serverError", {
          type: "server",
          message: errorMessage || "Registration failed. Please try again.",
        });
      }
    }
  }, [isError, error, setError]);

  // Clear server errors when user starts typing
  const handleInputChange = () => {
    if (isError) {
      clearErrors("root.serverError");
      resetMutation();
    }
  };

  // Form submission handler using React Hook Form
  const onSubmit = (formData) => {
    // Clear any previous errors
    clearErrors();

    // Prepare user data for API
    const userData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    // Call the mutation from useSignUp hook
    signUp(userData);
  };

  // Password strength indicator
  const getPasswordStrengthColor = () => {
    const count = Object.values(passwordStrength).filter(Boolean).length;
    if (count <= 2) return "bg-red-500";
    if (count <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    const count = Object.values(passwordStrength).filter(Boolean).length;
    if (count <= 2) return "Weak";
    if (count <= 4) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen w-2/3 mx-auto flex items-center justify-center p-4">
      <div className="card w-full max-w-4xl bg-base-100 shadow-xl">
        <div className="card-body p-6">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="card-title text-2xl font-bold justify-center mb-1">
              Create Account
            </h2>
            <p className="text-base-content/70 text-sm">
              Join FashionSmith today
            </p>
          </div>

          {/* General Error - Display server errors */}
          {formErrors?.root?.serverError && (
            <div className="alert alert-error mb-4">
              <span className="text-sm">
                {formErrors.root.serverError.message}
              </span>
            </div>
          )}

          {/* Form with React Hook Form integration */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* First Name with React Hook Form validation */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">First Name</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
                  <input
                    {...register("firstName", {
                      required: "First name is required",
                      minLength: {
                        value: 2,
                        message: "First name must be at least 2 characters",
                      },
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "First name can only contain letters",
                      },
                      onChange: handleInputChange, // Clear server errors on input
                    })}
                    type="text"
                    className={`input input-bordered w-full pl-10 input-sm ${
                      formErrors.firstName ? "input-error" : ""
                    }`}
                    placeholder="Enter first name"
                  />
                </div>
                {formErrors.firstName && (
                  <label className="label">
                    <span className="label-text-alt text-error text-xs">
                      {formErrors.firstName.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Last Name with React Hook Form validation */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">Last Name</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
                  <input
                    {...register("lastName", {
                      required: "Last name is required",
                      minLength: {
                        value: 2,
                        message: "Last name must be at least 2 characters",
                      },
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Last name can only contain letters",
                      },
                      onChange: handleInputChange, // Clear server errors on input
                    })}
                    type="text"
                    className={`input input-bordered w-full pl-10 input-sm ${
                      formErrors.lastName ? "input-error" : ""
                    }`}
                    placeholder="Enter last name"
                  />
                </div>
                {formErrors.lastName && (
                  <label className="label">
                    <span className="label-text-alt text-error text-xs">
                      {formErrors.lastName.message}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Email with React Hook Form validation */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Email Address</span>
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
                    onChange: handleInputChange, // Clear server errors on input
                  })}
                  type="email"
                  className={`input input-bordered w-full pl-10 input-sm ${
                    formErrors.email ? "input-error" : ""
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {formErrors.email && (
                <label className="label">
                  <span className="label-text-alt text-error text-xs">
                    {formErrors.email.message}
                  </span>
                </label>
              )}
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Password with React Hook Form validation */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">Password</span>
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
                  <input
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      validate: {
                        hasNumber: (value) =>
                          /[0-9]/.test(value) ||
                          "Password must contain a number",
                        hasUpper: (value) =>
                          /[A-Z]/.test(value) ||
                          "Password must contain an uppercase letter",
                        hasLower: (value) =>
                          /[a-z]/.test(value) ||
                          "Password must contain a lowercase letter",
                        hasSpecial: (value) =>
                          /[!@#$%^&*]/.test(value) ||
                          "Password must contain a special character",
                      },
                      onChange: handleInputChange, // Clear server errors on input
                    })}
                    type={showPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10 pr-10 input-sm ${
                      formErrors.password ? "input-error" : ""
                    }`}
                    placeholder="Create a password"
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
                  <label className="label">
                    <span className="label-text-alt text-error text-xs">
                      {formErrors.password.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Confirm Password with React Hook Form validation */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">Confirm Password</span>
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
                  <input
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => {
                        const password = watch("password");
                        return password === value || "Passwords do not match";
                      },
                      onChange: handleInputChange, // Clear server errors on input
                    })}
                    type={showConfirmPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10 pr-10 input-sm ${
                      formErrors.confirmPassword ? "input-error" : ""
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error text-xs">
                      {formErrors.confirmPassword.message}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Password Strength Indicator - Shows when password is being typed */}
            {watchedPassword && (
              <div className="form-control">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-base-content/70">
                    Password strength:
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      getPasswordStrengthColor().includes("red")
                        ? "text-error"
                        : getPasswordStrengthColor().includes("yellow")
                        ? "text-warning"
                        : "text-success"
                    }`}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <progress
                  className={`progress w-full h-1 ${
                    getPasswordStrengthColor().includes("red")
                      ? "progress-error"
                      : getPasswordStrengthColor().includes("yellow")
                      ? "progress-warning"
                      : "progress-success"
                  }`}
                  value={Object.values(passwordStrength).filter(Boolean).length}
                  max="5"
                ></progress>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {/* Password requirements checklist */}
                  {[
                    { key: "hasLength", text: "8+ chars" },
                    { key: "hasNumber", text: "Number" },
                    { key: "hasUpper", text: "Uppercase" },
                    { key: "hasLower", text: "Lowercase" },
                    { key: "hasSpecial", text: "Special" },
                  ].map(({ key, text }, index) => (
                    <div
                      key={key}
                      className={`flex items-center space-x-1 ${
                        index === 4 ? "col-span-2" : ""
                      }`}
                    >
                      <CheckCircleIcon
                        className={`w-3 h-3 ${
                          passwordStrength[key]
                            ? "text-success"
                            : "text-base-content/30"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          passwordStrength[key]
                            ? "text-success"
                            : "text-base-content/50"
                        }`}
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button - Uses TanStack Query loading state */}
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-base-content/70 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
