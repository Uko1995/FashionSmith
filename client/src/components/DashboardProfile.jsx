import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  CalendarIcon,
  ShieldCheckIcon,
  SparkleIcon,
  CrownIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  PhoneIcon,
  MapPinIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userAPI } from "../services/api";
import { useUiStore } from "../store/uiStore";
import SEO from "../components/SEO";

export default function Profile() {
  console.log("Profile component is rendering");

  const queryClient = useQueryClient();
  const { setUser } = useUiStore();
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
    // reset,
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
      setValue("phoneNumber", userProfile.phoneNumber || "");
      setValue("address.street", userProfile.address?.street || "");
      setValue("address.state", userProfile.address?.state || "");
      setValue("address.country", userProfile.address?.country || "");
    }
  }, [userProfile, setValue]);

  // Handle profile form submission
  const onSubmitProfile = async (data) => {
    // Format address data properly
    const formattedData = { ...data };

    // Handle address fields
    if (data.address) {
      const addressFields = ["street", "state", "country"];
      const hasAddressData = addressFields.some((field) =>
        data.address[field]?.trim()
      );

      if (hasAddressData) {
        formattedData.address = {};
        addressFields.forEach((field) => {
          if (data.address[field]?.trim()) {
            formattedData.address[field] = data.address[field].trim();
          }
        });
      } else {
        formattedData.address = null;
      }
    }

    updateProfileMutation.mutate(formattedData);
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
    : "2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4 md:p-6 lg:p-8">
      <SEO
        title="Profile - FashionSmith"
        description="Manage your FashionSmith profile, update personal information and account settings."
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            My Profile
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            Manage your account information and preferences in one beautiful
            place
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6 auto-rows-fr">
          {/* Profile Header Card - Large Featured Card */}
          <div className="md:col-span-2 lg:col-span-4 xl:col-span-4 row-span-2  h-fit">
            <div className="card bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 shadow-xl border border-primary/20 h-fit backdrop-blur-sm">
              <div className="card-body p-6 lg:p-8">
                <div className="flex flex-col  items-center gap-4 lg:gap-8 h-full">
                  {/* User Info */}
                  <div className="flex-1 text-center lg:text-left space-y-4">
                    <div>
                      <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold mt-4 mb-2 bg-gradient-to-r from-base-content to-base-content/80 bg-clip-text text-transparent">
                        {userProfile?.firstName} {userProfile?.lastName}
                      </h2>
                      <div className=" flex items-center  justify-center gap-5 space-y-2">
                        <p className="text-base-content/70 flex items-center justify-center lg:justify-start gap-1.5">
                          <EnvelopeIcon className="w-4 h-4" />
                          <span className="mb-1">{userProfile?.email}</span>
                        </p>

                        {userProfile?.phoneNumber && (
                          <p className="text-base-content/60 flex items-center justify-center lg:justify-start gap-1.5">
                            <PhoneIcon className="w-4 h-4" />
                            <span className="mb-1">
                              {userProfile.phoneNumber}
                            </span>
                          </p>
                        )}

                        {userProfile?.address && (
                          <p className="text-base-content/60 flex items-center justify-center lg:justify-start mb-3 gap-1.5">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="mb-1">
                              {[
                                userProfile.address.street,
                                userProfile.address.state,
                                userProfile.address.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                      <div className="badge badge-outline gap-2 p-3">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Since {memberSince}</span>
                      </div>
                      <div
                        className={`badge gap-2 p-3 ${
                          userProfile?.role === "admin"
                            ? "badge-warning"
                            : "badge-info"
                        }`}
                      >
                        {userProfile?.role === "admin" ? (
                          <CrownIcon className="w-4 h-4" />
                        ) : (
                          <StarIcon className="w-4 h-4" />
                        )}
                        <span className="capitalize">{userProfile?.role}</span>
                      </div>
                      {userProfile?.isVerified && (
                        <div className="badge badge-success gap-2 p-3">
                          <ShieldCheckIcon className="w-4 h-4" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-3 pt-4">
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="btn btn-primary gap-2 btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <PencilIcon className="w-5 h-5" />
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="btn btn-success gap-2 btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              <CheckIcon className="w-5 h-5" />
                            )}
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-outline gap-2 btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <XIcon className="w-5 h-5" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit Form Card - Full Width When Editing */}
                  {isEditing && (
                    <div className="md:col-span-2 lg:col-span-4 xl:col-span-6">
                      <div className="card bg-gradient-to-br from-neutral/5 to-base-100 shadow-xl border border-neutral/20 backdrop-blur-sm">
                        <div className="card-body p-6 lg:p-8">
                          <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/20 rounded-xl">
                              <UserIcon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="card-title text-2xl">
                              Edit Personal Information
                            </h3>
                          </div>
                          <form
                            onSubmit={handleSubmit(onSubmitProfile)}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                          >
                            {/* Basic Information Section */}
                            <div className="md:col-span-2">
                              <h4 className="text-lg font-semibold mb-4 text-primary">
                                Basic Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name */}
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text font-medium">
                                      First Name
                                    </span>
                                  </label>
                                  <input
                                    {...register("firstName", {
                                      required: "First name is required",
                                      minLength: {
                                        value: 2,
                                        message:
                                          "First name must be at least 2 characters",
                                      },
                                    })}
                                    type="text"
                                    className={`input input-bordered input-lg bg-base-100/80 backdrop-blur-sm ${
                                      errors.firstName
                                        ? "input-error"
                                        : "focus:border-primary"
                                    } ${!isEditing ? "input-disabled" : ""}`}
                                    disabled={!isEditing}
                                    placeholder="Enter your first name"
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
                                    <span className="label-text font-medium">
                                      Last Name
                                    </span>
                                  </label>
                                  <input
                                    {...register("lastName", {
                                      required: "Last name is required",
                                      minLength: {
                                        value: 2,
                                        message:
                                          "Last name must be at least 2 characters",
                                      },
                                    })}
                                    type="text"
                                    className={`input input-bordered input-lg bg-base-100/80 backdrop-blur-sm ${
                                      errors.lastName
                                        ? "input-error"
                                        : "focus:border-primary"
                                    } ${!isEditing ? "input-disabled" : ""}`}
                                    disabled={!isEditing}
                                    placeholder="Enter your last name"
                                  />
                                  {errors.lastName && (
                                    <label className="label">
                                      <span className="label-text-alt text-error">
                                        {errors.lastName.message}
                                      </span>
                                    </label>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="md:col-span-2">
                              <h4 className="text-lg font-semibold mb-4 text-accent">
                                Contact Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Email */}
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text font-medium">
                                      Email Address
                                    </span>
                                  </label>
                                  <div className="relative">
                                    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                                    <input
                                      {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                          message:
                                            "Please enter a valid email address",
                                        },
                                      })}
                                      type="email"
                                      className={`input input-bordered input-lg pl-12 bg-base-100/80 backdrop-blur-sm ${
                                        errors.email
                                          ? "input-error"
                                          : "focus:border-primary"
                                      } ${!isEditing ? "input-disabled" : ""}`}
                                      disabled={!isEditing}
                                      placeholder="your.email@example.com"
                                    />
                                  </div>
                                  {errors.email && (
                                    <label className="label">
                                      <span className="label-text-alt text-error">
                                        {errors.email.message}
                                      </span>
                                    </label>
                                  )}
                                </div>

                                {/* Phone Number */}
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text font-medium">
                                      Phone Number
                                    </span>
                                    <span className="label-text-alt text-base-content/50">
                                      Optional
                                    </span>
                                  </label>
                                  <div className="relative">
                                    <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                                    <input
                                      {...register("phoneNumber", {
                                        pattern: {
                                          value:
                                            /^\+234\s?\d{3}\s?\d{3}\s?\d{4}$/,
                                          message:
                                            "Please enter a valid Nigerian phone number (+234 123 456 7890)",
                                        },
                                      })}
                                      type="tel"
                                      className={`input input-bordered input-lg pl-12 bg-base-100/80 backdrop-blur-sm ${
                                        errors.phoneNumber
                                          ? "input-error"
                                          : "focus:border-primary"
                                      } ${!isEditing ? "input-disabled" : ""}`}
                                      placeholder="+234 123 456 7890"
                                      disabled={!isEditing}
                                    />
                                  </div>
                                  {errors.phoneNumber && (
                                    <label className="label">
                                      <span className="label-text-alt text-error">
                                        {errors.phoneNumber.message}
                                      </span>
                                    </label>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Address Section */}
                            <div className="md:col-span-2">
                              <div className="flex items-center gap-3 mb-4">
                                <MapPinIcon className="w-5 h-5 text-secondary" />
                                <h4 className="text-lg font-semibold text-secondary">
                                  Address Information
                                </h4>
                                <span className="badge badge-outline badge-sm">
                                  Optional
                                </span>
                              </div>

                              <div className="space-y-4">
                                {/* Street Address */}
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text font-medium">
                                      Street Address
                                    </span>
                                  </label>
                                  <input
                                    {...register("address.street")}
                                    type="text"
                                    className={`input w-full input-bordered input-lg bg-base-100/80 backdrop-blur-sm focus:border-primary ${
                                      !isEditing ? "input-disabled" : ""
                                    }`}
                                    placeholder="123 Pedro Street, Apartment 4B"
                                    disabled={!isEditing}
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-15">
                                  {/* State */}
                                  <div className="form-control">
                                    <label className="label">
                                      <span className="label-text font-medium">
                                        State
                                      </span>
                                    </label>
                                    <input
                                      {...register("address.state")}
                                      type="text"
                                      className={`input input-bordered  input-lg bg-base-100/80 backdrop-blur-sm focus:border-primary ${
                                        !isEditing ? "input-disabled" : ""
                                      }`}
                                      placeholder="Lagos State"
                                      disabled={!isEditing}
                                    />
                                  </div>

                                  {/* Country */}
                                  <div className="form-control lg:col-span-2">
                                    <label className="label">
                                      <span className="label-text font-medium">
                                        Country
                                      </span>
                                    </label>
                                    <input
                                      {...register("address.country")}
                                      type="text"
                                      className={`input input-bordered input-lg bg-base-100/80 backdrop-blur-sm focus:border-primary ${
                                        !isEditing ? "input-disabled" : ""
                                      }`}
                                      placeholder="Nigeria"
                                      disabled={!isEditing}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Card - Tall Card */}
          <div className="md:col-span-1 lg:col-span-2 xl:col-span-2 row-span-2  h-fit">
            <div className="card bg-gradient-to-br from-success/10 to-info/10 shadow-xl border border-success/20 h-fit backdrop-blur-sm">
              <div className="card-body p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-success/20 rounded-xl">
                    <LockIcon className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="card-title text-xl">Security & Privacy</h3>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-base-content/90 mb-3">
                        Verification Status
                      </p>
                      {userProfile?.isVerified ? (
                        <div className="alert alert-success shadow-md">
                          <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              Email Verified
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-warning shadow-md">
                          <div className="flex items-center gap-2">
                            <SparkleIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              Email Pending Verification
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="divider my-4"></div>

                    <div>
                      <p className="text-sm font-medium text-base-content/90 mb-2">
                        Password Security
                      </p>
                      <p className="text-xs text-base-content/60 mb-4">
                        Keep your account secure with a strong password
                      </p>
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="btn btn-outline btn-sm w-full gap-2 hover:bg-success hover:border-success hover:text-success-content transition-all duration-300"
                      >
                        <LockIcon className="w-4 h-4" />
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Overview Card - Small Card */}
          <div
            className={`md:col-span-1 lg:col-span-3 xl:col-span-4 h-fit ${
              isEditing ? "" : "-mt-18"
            } `}
          >
            <div className="card bg-gradient-to-br from-warning/10 to-accent/10 shadow-xl border border-warning/20 h-full backdrop-blur-sm">
              <div className="card-body p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-warning/20 rounded-xl">
                    <StarIcon className="w-6 h-6 text-warning" />
                  </div>
                  <h3 className="card-title">Account Stats</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-base-100/50 rounded-xl">
                    <span className="text-sm font-medium text-base-content/80">
                      Status
                    </span>
                    <span className="badge badge-success">Active</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-base-100/50 rounded-xl">
                    <span className="text-sm font-medium text-base-content/80">
                      Total Orders
                    </span>
                    <span className="text-lg font-bold text-primary">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card bg-gradient-to-br from-base-100 to-base-200 w-full max-w-lg shadow-2xl border border-primary/20">
              <div className="card-body p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <LockIcon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="card-title text-xl">Change Password</h3>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="btn btn-ghost btn-sm btn-circle hover:bg-error/20 hover:text-error transition-all duration-300"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={handlePasswordSubmit(onSubmitPassword)}
                  className="space-y-6"
                >
                  {/* Current Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content/90">
                        Current Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword("currentPassword", {
                          required: "Current password is required",
                        })}
                        type={showCurrentPassword ? "text" : "password"}
                        className={`input input-bordered input-lg w-full pr-12 bg-base-100/80 backdrop-blur-sm ${
                          passwordErrors.currentPassword
                            ? "input-error"
                            : "focus:border-primary"
                        }`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-primary transition-colors duration-200"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="w-5 h-5 text-base-content/50" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-base-content/50" />
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
                      <span className="label-text font-medium text-base-content/90">
                        New Password
                      </span>
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
                        className={`input input-bordered input-lg w-full pr-12 bg-base-100/80 backdrop-blur-sm ${
                          passwordErrors.newPassword
                            ? "input-error"
                            : "focus:border-primary"
                        }`}
                        placeholder="Enter new password"
                        autoComplete={false}
                        //Asdfghj1/@
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-primary transition-colors duration-200"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="w-5 h-5 text-base-content/50" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-base-content/50" />
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
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Password strength:</span>
                        <span
                          className={`font-semibold ${passwordStrength.color}`}
                        >
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full bg-base-300 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 2
                              ? "bg-error"
                              : passwordStrength.score <= 4
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="btn btn-primary flex-1 btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
                      className="btn btn-outline btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
