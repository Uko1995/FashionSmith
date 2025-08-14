import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  ShieldCheckIcon,
  SparkleIcon,
  CrownIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userAPI } from "../services/api";
import { useUiStore } from "../store/uiStore";
import SEO from "../components/SEO";

export default function Profile() {
  console.log("Profile component is rendering");

  const queryClient = useQueryClient();
  const { user: currentUser, setUser } = useUiStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Fetch user profile data
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: userAPI.getProfile,
    select: (response) => response.data,
  });

  console.log("user profile", userProfile);
  console.log("profile loading", profileLoading);
  console.log("profile error", profileError);

  // Form for profile editing
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    mode: "onChange",
  });

  // Form for password change
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm({
    mode: "onChange",
  });

  // Watch password for validation
  const watchPassword = watch("newPassword");

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (response) => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setUser(response.data.user);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data) => userAPI.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setShowPasswordForm(false);
      resetPassword();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
    },
  });

  // Set form values when user data loads
  useEffect(() => {
    if (userProfile) {
      setValue("firstName", userProfile.firstName || "");
      setValue("lastName", userProfile.lastName || "");
      setValue("email", userProfile.email || "");
    }
  }, [userProfile, setValue]);

  // Handle profile form submission
  const onSubmitProfile = async (data) => {
    updateProfileMutation.mutate(data);
  };

  // Handle password form submission
  const onSubmitPassword = async (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  // Cancel editing
  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  // Password strength validation
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: "", color: "" };

    const checks = {
      length: password.length >= 8,
      number: /[0-9]/.test(password),
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { score, text: "Weak", color: "text-error" };
    if (score <= 4) return { score, text: "Medium", color: "text-warning" };
    return { score, text: "Strong", color: "text-success" };
  };

  const passwordStrength = getPasswordStrength(watchPassword);

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-base-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="alert alert-error">
            <span>Failed to load profile: {profileError.message}</span>
          </div>
        </div>
      </div>
    );
  }

  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Unknown";

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <SEO
        title="Profile - FashionSmith"
        description="Manage your FashionSmith profile, update personal information and account settings."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            My Profile
          </h1>
          <p className="text-base-content/70">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="card bg-gradient-to-r from-primary/10 to-accent/10 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-24 h-24 lg:w-32 lg:h-32">
                    <span className="text-2xl lg:text-4xl font-bold">
                      {userProfile?.firstName?.[0]}
                      {userProfile?.lastName?.[0]}
                    </span>
                  </div>
                </div>
                {userProfile?.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-2">
                    <ShieldCheckIcon className="w-4 h-4 text-success-content" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                  {userProfile?.firstName} {userProfile?.lastName}
                </h2>
                <p className="text-base-content/70 mb-3">
                  {userProfile?.email}
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span>Member since {memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {userProfile?.role === "admin" ? (
                      <>
                        <CrownIcon className="w-4 h-4 text-warning" />
                        <span className="badge badge-warning badge-sm">
                          Admin
                        </span>
                      </>
                    ) : (
                      <>
                        <StarIcon className="w-4 h-4 text-info" />
                        <span className="badge badge-info badge-sm">
                          Customer
                        </span>
                      </>
                    )}
                  </div>
                  {userProfile?.isVerified && (
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4 text-success" />
                      <span className="text-success font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit(onSubmitProfile)}
                      className="btn btn-success gap-2"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <CheckIcon className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-outline gap-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-6">
                  <UserIcon className="w-5 h-5 text-primary" />
                  <h3 className="card-title">Personal Information</h3>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmitProfile)}
                  className="space-y-4"
                >
                  {/* First Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">First Name</span>
                    </label>
                    <input
                      {...register("firstName", {
                        required: "First name is required",
                        minLength: {
                          value: 2,
                          message: "First name must be at least 2 characters",
                        },
                      })}
                      type="text"
                      className={`input input-bordered $${
                        errors.firstName ? "input-error" : ""
                      } ${!isEditing ? "input-disabled" : ""}`}
                      disabled={!isEditing}
                    />
                    {errors.firstName && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.firstName.message}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Last Name</span>
                    </label>
                    <input
                      {...register("lastName", {
                        required: "Last name is required",
                        minLength: {
                          value: 2,
                          message: "Last name must be at least 2 characters",
                        },
                      })}
                      type="text"
                      className={`input input-bordered ${
                        errors.lastName ? "input-error" : ""
                      } ${!isEditing ? "input-disabled" : ""}`}
                      disabled={!isEditing}
                    />
                    {errors.lastName && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.lastName.message}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Email Address
                      </span>
                    </label>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                      type="email"
                      className={`input input-bordered ${
                        errors.email ? "input-error" : ""
                      } ${!isEditing ? "input-disabled" : ""}`}
                      disabled={!isEditing}
                    />
                    {errors.email && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.email.message}
                        </span>
                      </label>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-6">
            {/* Account Security */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <LockIcon className="w-5 h-5 text-primary" />
                  <h3 className="card-title">Security</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-base-content/70 mb-2">
                      Password
                    </p>
                    <p className="text-sm mb-3">Last changed: Unknown</p>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="btn btn-outline btn-sm w-full"
                    >
                      Change Password
                    </button>
                  </div>

                  {userProfile?.isVerified ? (
                    <div className="alert alert-success">
                      <ShieldCheckIcon className="w-4 h-4" />
                      <span className="text-sm">Email verified</span>
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      <SparkleIcon className="w-4 h-4" />
                      <span className="text-sm">Email not verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">Account Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-base-content/70">Status</span>
                    <span className="badge badge-success badge-sm">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-base-content/70">Orders</span>
                    <span className="text-sm font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-base-content/70">Role</span>
                    <span className="text-sm font-medium capitalize">
                      {userProfile?.role || "User"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card bg-base-100 w-full max-w-md">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="card-title">Change Password</h3>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={handlePasswordSubmit(onSubmitPassword)}
                  className="space-y-4"
                >
                  {/* Current Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Current Password</span>
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword("currentPassword", {
                          required: "Current password is required",
                        })}
                        type={showCurrentPassword ? "text" : "password"}
                        className={`input input-bordered w-full pr-10 ${
                          passwordErrors.currentPassword ? "input-error" : ""
                        }`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="w-4 h-4 text-base-content/50" />
                        ) : (
                          <EyeIcon className="w-4 h-4 text-base-content/50" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {passwordErrors.currentPassword.message}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">New Password</span>
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword("newPassword", {
                          required: "New password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                          },
                          validate: {
                            hasNumber: (value) =>
                              /[0-9]/.test(value) || "Must contain a number",
                            hasUpper: (value) =>
                              /[A-Z]/.test(value) ||
                              "Must contain uppercase letter",
                            hasLower: (value) =>
                              /[a-z]/.test(value) ||
                              "Must contain lowercase letter",
                            hasSpecial: (value) =>
                              /[!@#$%^&*]/.test(value) ||
                              "Must contain special character",
                          },
                        })}
                        type={showNewPassword ? "text" : "password"}
                        className={`input input-bordered w-full pr-10 ${
                          passwordErrors.newPassword ? "input-error" : ""
                        }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="w-4 h-4 text-base-content/50" />
                        ) : (
                          <EyeIcon className="w-4 h-4 text-base-content/50" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {passwordErrors.newPassword.message}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Password Strength Indicator */}
                  {watchPassword && (
                    <div className="form-control">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Password strength:</span>
                        <span className={passwordStrength.color}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <progress
                        className={`progress w-full h-1 ${
                          passwordStrength.score <= 2
                            ? "progress-error"
                            : passwordStrength.score <= 4
                            ? "progress-warning"
                            : "progress-success"
                        }`}
                        value={passwordStrength.score}
                        max="5"
                      ></progress>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
