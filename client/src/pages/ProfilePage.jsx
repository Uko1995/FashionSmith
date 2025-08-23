import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
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
  PackageIcon,
  BellIcon,
  CreditCardIcon,
  GearIcon,
  CameraIcon,
  TrashIcon,
  XIcon,
  UserCircleGearIcon,
  RulerIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userAPI } from "../services/api";
import { useUiStore } from "../store/uiStore";
import SEO from "../components/SEO";
import ProfilePageTabs from "../components/ProfilePageTabs";
import DashboardMeasurements from "../components/DashboardMeasurements";
import RedAsterix from "../components/RedAsterix";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { setUser } = useUiStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Handle URL parameters for tab switching
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    if (
      tab &&
      ["overview", "orders", "measurements", "notifications", "payments"].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [location.search]);

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

  console.log(userProfile);

  // Form for profile editing
  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const watchPassword = watch("newPassword");

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => {
      // Create FormData for file upload
      const formData = new FormData();

      // Add form fields
      Object.keys(data).forEach((key) => {
        if (key === "address" && data[key]) {
          // Handle nested address object
          Object.keys(data[key]).forEach((addressKey) => {
            if (data[key][addressKey]) {
              formData.append(`address[${addressKey}]`, data[key][addressKey]);
            }
          });
        } else if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      // Add profile image if selected
      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      return userAPI.updateProfile(formData);
    },
    onSuccess: (response) => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setUser(response.data.user);
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
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
  const user = useMemo(() => userProfile || {}, [userProfile]);
  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("email", user.email || "");
      setValue("phoneNumber", user.phoneNumber || "");
      setValue("address.street", user.address?.street || "");
      setValue("address.state", user.address?.state || "");
      setValue("address.country", user.address?.country || "");
    }
  }, [user, setValue]);

  // Handle form submissions
  const onSubmitProfile = async (data) => {
    const formattedData = { ...data };

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

  const onSubmitPassword = async (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Image handling functions
  const handleImageSelect = (event) => {
    console.log("Image select triggered", event.target.files); // Debug log
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file.name, file.type, file.size); // Debug log
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    console.log("Upload button clicked"); // Debug log
    const fileInput = document.getElementById("profileImageInput");
    console.log("File input element:", fileInput); // Debug log
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("profileImageInput");
    if (fileInput) {
      fileInput.value = "";
    }
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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Unknown";

  const tabs = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "orders", label: "Orders", icon: PackageIcon },
    { id: "measurements", label: "Measurements", icon: RulerIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "payments", label: "Payments", icon: CreditCardIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4 md:p-6 lg:p-8">
      <SEO
        title="Profile - FashionSmith"
        description="Manage your FashionSmith profile, orders, and account settings."
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            My Profile
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            Manage your account, orders, and preferences
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="card bg-gradient-to-r from-primary/10 to-accent/10 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="avatar">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full">
                    {imagePreview || userProfile?.profileImage ? (
                      <img
                        src={imagePreview || userProfile.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
                        <span className="text-2xl lg:text-4xl font-bold">
                          {userProfile?.firstName?.[0]}
                          {userProfile?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image upload controls */}
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <button
                      onClick={handleUploadClick}
                      className="btn btn-circle btn-sm btn-primary"
                      title="Upload Photo"
                    >
                      <CameraIcon size={16} />
                    </button>
                    {(selectedImage || userProfile?.profileImage) && (
                      <button
                        onClick={handleImageRemove}
                        className="btn btn-circle btn-sm btn-error"
                        title="Remove Photo"
                      >
                        <TrashIcon size={16} />
                      </button>
                    )}
                    {/* Hidden file input */}
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-base-content/70 mb-3">{user?.email}</p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span>Member since {memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.role === "admin" ? (
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
                  {user?.isVerified && (
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4 text-success" />
                      <span className="text-success font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-wrap gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary gap-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit Profile
                    </button>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="btn btn-secondary gap-2 hover:btn-secondary-focus transition-all duration-200"
                      >
                        <UserCircleGearIcon className="w-4 h-4" />
                        Admin Dashboard
                      </button>
                    )}
                  </>
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
                      <XIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200/80 backdrop-blur-sm mb-8 p-2 shadow-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab tab-lg flex-1 gap-2 ${
                  activeTab === tab.id ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Information */}
            <div className="lg:col-span-2">
              <div className="card bg-base-100 shadow-xl border border-base-300/50">
                <div className="card-body p-6">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <UserIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="card-title text-xl">
                        Personal Information
                      </h3>
                      <p className="text-sm text-base-content/60">
                        Update your personal details
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmit(onSubmitProfile)}
                    className="space-y-6"
                  >
                    {/* Name Fields - Side by side on larger screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold text-base-content">
                            First Name
                          </span>
                          <RedAsterix />
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
                          className={`input input-bordered focus:input-primary transition-all duration-200 ${
                            errors.firstName ? "input-error" : ""
                          } ${
                            !isEditing
                              ? "input-disabled bg-base-200/50"
                              : "bg-white"
                          }`}
                          disabled={!isEditing}
                          placeholder="Enter your first name"
                        />
                        {errors.firstName && (
                          <label className="label">
                            <span className="label-text-alt text-error flex items-center gap-1">
                              <span className="w-1 h-1 bg-error rounded-full"></span>
                              {errors.firstName.message}
                            </span>
                          </label>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold text-base-content">
                            Last Name
                          </span>
                          <RedAsterix />
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
                          className={`input input-bordered focus:input-primary transition-all text-base-content duration-200 ${
                            errors.lastName ? "input-error" : ""
                          } ${
                            !isEditing
                              ? "input-disabled bg-base-200/50"
                              : "bg-white"
                          }`}
                          disabled={!isEditing}
                          placeholder="Enter your last name"
                        />
                        {errors.lastName && (
                          <label className="label">
                            <span className="label-text-alt text-error flex items-center gap-1">
                              <span className="w-1 h-1 bg-error rounded-full"></span>
                              {errors.lastName.message}
                            </span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="form-control flex flex-col">
                      <label className="label">
                        <span className="label-text font-semibold text-base-content flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4" />
                          Email Address
                        </span>
                        <RedAsterix />
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
                        className={`input input-bordered focus:input-primary transition-all duration-200 ${
                          errors.email ? "input-error" : ""
                        } ${
                          !isEditing
                            ? "input-disabled bg-base-200/50"
                            : "bg-white"
                        }`}
                        disabled={!isEditing}
                        placeholder="Enter your email address"
                      />
                      {errors.email && (
                        <label className="label">
                          <span className="label-text-alt text-error flex items-center gap-1">
                            <span className="w-1 h-1 bg-error rounded-full"></span>
                            {errors.email.message}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="form-control flex flex-col">
                      <label className="label">
                        <span className="label-text font-semibold text-base-content flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4" />
                          Phone Number
                        </span>
                        <RedAsterix />
                      </label>
                      <input
                        {...register("phoneNumber")}
                        type="tel"
                        className={`input input-bordered focus:input-primary transition-all duration-200 ${
                          !isEditing
                            ? "input-disabled bg-base-200/50"
                            : "bg-white"
                        }`}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {/* Address Section */}
                    <div className="divider">
                      <span className="text-base-content/60 flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        Address Information
                      </span>
                    </div>

                    {/* Street Address */}
                    <div className="form-control flex flex-col">
                      <label className="label">
                        <span className="label-text font-semibold text-base-content">
                          Street Address
                        </span>
                        <RedAsterix />
                      </label>
                      <input
                        {...register("address.street")}
                        type="text"
                        className={`input input-bordered focus:input-primary transition-all duration-200 ${
                          !isEditing
                            ? "input-disabled bg-base-200/50"
                            : "bg-white"
                        }`}
                        disabled={!isEditing}
                        placeholder="Enter your street address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control flex flex-col">
                        <label className="label">
                          <span className="label-text font-semibold text-base-content">
                            State
                          </span>
                          <RedAsterix />
                        </label>
                        <input
                          {...register("address.state")}
                          type="text"
                          className={`input input-bordered focus:input-primary transition-all duration-200 ${
                            !isEditing
                              ? "input-disabled bg-base-200/50"
                              : "bg-white"
                          }`}
                          disabled={!isEditing}
                          placeholder="Enter your state"
                        />
                      </div>

                      <div className="form-control flex flex-col">
                        <label className="label">
                          <span className="label-text font-semibold text-base-content">
                            Country
                          </span>
                          <RedAsterix />
                        </label>
                        <input
                          {...register("address.country")}
                          type="text"
                          className={`input input-bordered focus:input-primary transition-all duration-200 ${
                            !isEditing
                              ? "input-disabled bg-base-200/50"
                              : "bg-white"
                          }`}
                          disabled={!isEditing}
                          placeholder="Enter your country"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="space-y-6">
              {/* Account Security */}
              <div className="card bg-base-100 shadow-xl border border-base-300/50">
                <div className="card-body p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-secondary/10 rounded-xl">
                      <LockIcon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="card-title text-xl">Security</h3>
                      <p className="text-sm text-base-content/60">
                        Manage your account security
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-base-200/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-base-content">
                            Password
                          </p>
                          <p className="text-sm text-base-content/60">
                            Last changed: Unknown
                          </p>
                        </div>
                        <LockIcon className="w-5 h-5 text-base-content/40" />
                      </div>
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="btn btn-outline btn-sm w-full hover:btn-primary transition-all duration-200"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="p-4 bg-base-200/50 rounded-xl">
                      {user?.isVerified ? (
                        <div className="alert alert-success">
                          <ShieldCheckIcon className="w-5 h-5" />
                          <div>
                            <div className="font-semibold">Email Verified</div>
                            <div className="text-sm opacity-80">
                              Your email has been verified
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-warning">
                          <SparkleIcon className="w-5 h-5" />
                          <div>
                            <div className="font-semibold">
                              Email Not Verified
                            </div>
                            <div className="text-sm opacity-80">
                              Please verify your email address
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="card bg-base-100 shadow-xl border border-base-300/50">
                <div className="card-body p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-accent/10 rounded-xl">
                      <GearIcon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="card-title text-xl">Quick Actions</h3>
                      <p className="text-sm text-base-content/60">
                        Navigate to different sections
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {user?.role === "admin" && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="btn btn-secondary w-full justify-start hover:btn-secondary-focus transition-all duration-200 group"
                      >
                        <UserCircleGearIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="flex-1 text-left">
                          Admin Dashboard
                        </span>
                        <span className="opacity-60">→</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab("measurements")}
                      className="btn btn-outline w-full justify-start hover:btn-primary transition-all duration-200 group"
                    >
                      <RulerIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="flex-1 text-left">My Measurements</span>
                      <span className="opacity-60">→</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="btn btn-outline w-full justify-start hover:btn-primary transition-all duration-200 group"
                    >
                      <PackageIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="flex-1 text-left">View Orders</span>
                      <span className="opacity-60">→</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("notifications")}
                      className="btn btn-outline w-full justify-start hover:btn-primary transition-all duration-200 group"
                    >
                      <BellIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="flex-1 text-left">Notifications</span>
                      <span className="opacity-60">→</span>
                    </button>
                    <button
                      onClick={() => (window.location.href = "/settings")}
                      className="btn btn-outline w-full justify-start hover:btn-primary transition-all duration-200 group"
                    >
                      <GearIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                      <span className="flex-1 text-left">Settings</span>
                      <span className="opacity-60">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Measurements Tab */}
        {activeTab === "measurements" && (
          <div className="space-y-6">
            <DashboardMeasurements />
          </div>
        )}

        {/* Other tab content handled by ProfilePageTabs component */}
        {activeTab !== "overview" && activeTab !== "measurements" && (
          <ProfilePageTabs activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {/* Password Change Modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="card bg-base-100 shadow-2xl w-full max-w-md border border-base-300/50">
              <div className="card-body p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <LockIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="card-title text-xl">Change Password</h3>
                      <p className="text-sm text-base-content/60">
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={handlePasswordSubmit(onSubmitPassword)}
                  className="space-y-5"
                >
                  {/* Current Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Current Password
                      </span>
                      <RedAsterix />
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword("currentPassword", {
                          required: "Current password is required",
                        })}
                        type={showCurrentPassword ? "text" : "password"}
                        className={`input input-bordered w-full pr-12 focus:input-primary transition-all duration-200 ${
                          passwordErrors.currentPassword ? "input-error" : ""
                        }`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <label className="label">
                        <span className="label-text-alt text-error flex items-center gap-1">
                          <span className="w-1 h-1 bg-error rounded-full"></span>
                          {passwordErrors.currentPassword.message}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        New Password
                      </span>
                      <RedAsterix />
                    </label>
                    <div className="relative">
                      <input
                        {...registerPassword("newPassword", {
                          required: "New password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                          },
                        })}
                        type={showNewPassword ? "text" : "password"}
                        className={`input input-bordered w-full pr-12 focus:input-primary transition-all duration-200 ${
                          passwordErrors.newPassword ? "input-error" : ""
                        }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="w-4 h-4" />
                        ) : (
                          <EyeIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <label className="label">
                        <span className="label-text-alt text-error flex items-center gap-1">
                          <span className="w-1 h-1 bg-error rounded-full"></span>
                          {passwordErrors.newPassword.message}
                        </span>
                      </label>
                    )}

                    {/* Password Strength */}
                    {watchPassword && (
                      <div className="mt-3 p-3 bg-base-200/50 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Password Strength</span>
                          <span
                            className={`font-semibold ${passwordStrength.color}`}
                          >
                            {passwordStrength.text}
                          </span>
                        </div>
                        <progress
                          className={`progress w-full h-2 ${
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
                  </div>

                  {/* Confirm Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Confirm New Password
                      </span>
                      <RedAsterix />
                    </label>
                    <input
                      {...registerPassword("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === watchPassword || "Passwords do not match",
                      })}
                      type="password"
                      className={`input input-bordered focus:input-primary transition-all duration-200 ${
                        passwordErrors.confirmPassword ? "input-error" : ""
                      }`}
                      placeholder="Confirm new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <label className="label">
                        <span className="label-text-alt text-error flex items-center gap-1">
                          <span className="w-1 h-1 bg-error rounded-full"></span>
                          {passwordErrors.confirmPassword.message}
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="card-actions justify-end pt-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="btn btn-outline hover:btn-ghost transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary hover:btn-primary-focus transition-all duration-200 shadow-lg"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <LockIcon className="w-4 h-4" />
                          Change Password
                        </>
                      )}
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
