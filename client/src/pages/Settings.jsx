import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BellIcon,
  CreditCardIcon,
  PaintBrushIcon,
  DeviceTabletSpeakerIcon,
  MoonIcon,
  SunIcon,
  RulerIcon,
  GearIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  DeviceMobileIcon,
  EyeIcon,
  TrashIcon,
  DownloadIcon,
  ArrowSquareRightIcon,
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userAPI } from "../services/api";
import useLogoutWithNav from "../hooks/useLogoutWithNav";
import SEO from "../components/SEO";

export default function Settings() {
  const queryClient = useQueryClient();
  const { logout } = useLogoutWithNav();
  const [activeTab, setActiveTab] = useState("measurements");

  // Fetch user profile
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: userAPI.getProfile,
  });

  const user = userProfile?.data?.user || {};

  // fetch measurements
  const { data: userMeasurements } = useQuery({
    queryKey: ["userMeasurements"],
    queryFn: userAPI.getMeasurements,
  });

  const measurementsUnit = userMeasurements?.data?.unit || "inches";

  const [preferences, setPreferences] = useState({
    measurementUnit: measurementsUnit,
    orderUpdates: user.preferences?.orderUpdates ?? true,
    paymentNotifications: user.preferences?.paymentNotifications ?? true,
    autoSaveReceipts: user.preferences?.autoSaveReceipts ?? true,
    emailNotifications: user.preferences?.emailNotifications ?? true,
    smsNotifications: user.preferences?.smsNotifications ?? false,
    marketingEmails: user.preferences?.marketingEmails ?? false,
    theme: user.preferences?.theme || "light",
    language: user.preferences?.language || "en",
  });

  // Update preferences when measurements unit changes
  useEffect(() => {
    setPreferences((prev) => ({
      ...prev,
      measurementUnit: measurementsUnit,
    }));
  }, [measurementsUnit]);

  // update measurements
  const updateMeasurementUnit = useMutation({
    mutationFn: (unit) => userAPI.updateMeasurement({ unit }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMeasurements"] });
      toast.success("Unit of measurement updated successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update your unit of measurement"
      );
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (data) => userAPI.updateProfile({ preferences: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Preferences updated successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update preferences"
      );
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: userAPI.deleteAccount,
    onSuccess: () => {
      toast.success("Account deleted successfully");
      logout();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete account");
    },
  });

  const handlePreferencesUpdate = (key, value) => {
    if (key === "measurementUnit") {
      // Update measurement unit in the measurements collection only
      updateMeasurementUnit.mutate(value);
      // Update local state for immediate UI feedback
      setPreferences((prev) => ({ ...prev, [key]: value }));
    } else {
      // For other preferences, update user profile
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);
      updatePreferencesMutation.mutate(newPreferences);
    }
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (confirmDelete) {
      deleteAccountMutation.mutate();
    }
  };

  const settingsTabs = [
    { id: "measurements", label: "Measurements", icon: RulerIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "appearance", label: "Appearance", icon: PaintBrushIcon },
    { id: "privacy", label: "Privacy & Security", icon: ShieldCheckIcon },
    { id: "account", label: "Account", icon: GearIcon },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4 md:p-6 lg:p-8">
      <SEO
        title="Settings - FashionSmith"
        description="Manage your FashionSmith account settings and preferences."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Settings
          </h1>
          <p className="text-base-content/70 text-lg">
            Customize your FashionSmith experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-4">
                <ul className="menu menu-sm">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-3 ${
                            activeTab === tab.id ? "active" : ""
                          }`}
                        >
                          <Icon size={18} />
                          {tab.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {activeTab === "measurements" && (
                  <div>
                    <h2 className="card-title mb-6">Measurement Preferences</h2>

                    <div className="space-y-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">
                            Unit of Measurement
                          </span>
                          <span className="label-text-alt">
                            Choose your preferred measurement unit
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full max-w-xs"
                          value={preferences.measurementUnit}
                          onChange={(e) =>
                            handlePreferencesUpdate(
                              "measurementUnit",
                              e.target.value
                            )
                          }
                        >
                          <option value="inches">Inches</option>
                          <option value="centimeters">Centimeters</option>
                        </select>
                      </div>

                      <div className="divider"></div>

                      <div className="alert alert-info">
                        <RulerIcon className="w-6 h-6" />
                        <div>
                          <h3 className="font-bold">Measurement Tips</h3>
                          <div className="text-sm">
                            • Always measure over undergarments
                            <br />
                            • Keep the measuring tape snug but not tight
                            <br />• Take measurements in front of a mirror
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() =>
                            (window.location.href = "/dashboard/measurements")
                          }
                          className="btn btn-primary"
                        >
                          <RulerIcon size={16} className="mr-2" />
                          Update Measurements
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div>
                    <h2 className="card-title mb-6">
                      Notification Preferences
                    </h2>

                    <div className="space-y-6">
                      {/* Order Updates */}
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <div className="flex items-center gap-3">
                            <BellIcon className="w-5 h-5 text-primary" />
                            <div>
                              <span className="label-text font-medium">
                                Order Updates
                              </span>
                              <div className="text-sm text-base-content/60">
                                Get notified about order status changes
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={preferences.orderUpdates}
                            onChange={(e) =>
                              handlePreferencesUpdate(
                                "orderUpdates",
                                e.target.checked
                              )
                            }
                          />
                        </label>
                      </div>

                      {/* Payment Notifications */}
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <div className="flex items-center gap-3">
                            <CreditCardIcon className="w-5 h-5 text-primary" />
                            <div>
                              <span className="label-text font-medium">
                                Payment Notifications
                              </span>
                              <div className="text-sm text-base-content/60">
                                Receive notifications for payment activities
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={preferences.paymentNotifications}
                            onChange={(e) =>
                              handlePreferencesUpdate(
                                "paymentNotifications",
                                e.target.checked
                              )
                            }
                          />
                        </label>
                      </div>

                      {/* Email Notifications */}
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <div className="flex items-center gap-3">
                            <EnvelopeIcon className="w-5 h-5 text-primary" />
                            <div>
                              <span className="label-text font-medium">
                                Email Notifications
                              </span>
                              <div className="text-sm text-base-content/60">
                                Receive notifications via email
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={preferences.emailNotifications}
                            onChange={(e) =>
                              handlePreferencesUpdate(
                                "emailNotifications",
                                e.target.checked
                              )
                            }
                          />
                        </label>
                      </div>

                      {/* SMS Notifications */}
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <div className="flex items-center gap-3">
                            <DeviceMobileIcon className="w-5 h-5 text-primary" />
                            <div>
                              <span className="label-text font-medium">
                                SMS Notifications
                              </span>
                              <div className="text-sm text-base-content/60">
                                Receive notifications via SMS
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={preferences.smsNotifications}
                            onChange={(e) =>
                              handlePreferencesUpdate(
                                "smsNotifications",
                                e.target.checked
                              )
                            }
                          />
                        </label>
                      </div>

                      {/* Marketing Emails */}
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <div className="flex items-center gap-3">
                            <EnvelopeIcon className="w-5 h-5 text-accent" />
                            <div>
                              <span className="label-text font-medium">
                                Marketing Emails
                              </span>
                              <div className="text-sm text-base-content/60">
                                Receive promotional emails and offers
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-accent"
                            checked={preferences.marketingEmails}
                            onChange={(e) =>
                              handlePreferencesUpdate(
                                "marketingEmails",
                                e.target.checked
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div>
                    <h2 className="card-title mb-6">Appearance & Display</h2>

                    <div className="space-y-6">
                      {/* Theme */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Theme</span>
                          <span className="label-text-alt">
                            Choose your preferred theme
                          </span>
                        </label>
                        <div className="flex gap-4">
                          <label className="label cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              className="radio radio-primary"
                              value="light"
                              checked={preferences.theme === "light"}
                              onChange={(e) =>
                                handlePreferencesUpdate("theme", e.target.value)
                              }
                            />
                            <div className="flex items-center gap-2 ml-2">
                              <SunIcon className="w-4 h-4" />
                              <span className="label-text">Light</span>
                            </div>
                          </label>
                          <label className="label cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              className="radio radio-primary"
                              value="dark"
                              checked={preferences.theme === "dark"}
                              onChange={(e) =>
                                handlePreferencesUpdate("theme", e.target.value)
                              }
                            />
                            <div className="flex items-center gap-2 ml-2">
                              <MoonIcon className="w-4 h-4" />
                              <span className="label-text">Dark</span>
                            </div>
                          </label>
                          <label className="label cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              className="radio radio-primary"
                              value="auto"
                              checked={preferences.theme === "auto"}
                              onChange={(e) =>
                                handlePreferencesUpdate("theme", e.target.value)
                              }
                            />
                            <div className="flex items-center gap-2 ml-2">
                              <DeviceTabletSpeakerIcon className="w-4 h-4" />
                              <span className="label-text">Auto</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Language */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">
                            Language
                          </span>
                          <span className="label-text-alt">
                            Select your preferred language
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full max-w-xs"
                          value={preferences.language}
                          onChange={(e) =>
                            handlePreferencesUpdate("language", e.target.value)
                          }
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div>
                    <h2 className="card-title mb-6">Privacy & Security</h2>

                    <div className="space-y-6">
                      {/* Account Verification Status */}
                      <div className="alert alert-success">
                        <ShieldCheckIcon className="w-6 h-6" />
                        <div>
                          <h3 className="font-bold">Account Status</h3>
                          <div className="text-sm">
                            Your account is{" "}
                            {user.isVerified ? "verified" : "not verified"}
                          </div>
                        </div>
                      </div>

                      {/* Auto-save Receipts */}
                      <div className="form-control">
                        <label className="label cursor-pointer">
                          <div className="flex items-center gap-3">
                            <DownloadIcon className="w-5 h-5 text-primary" />
                            <div>
                              <span className="label-text font-medium">
                                Auto-save Receipts
                              </span>
                              <div className="text-sm text-base-content/60">
                                Automatically save order receipts
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={preferences.autoSaveReceipts}
                            onChange={(e) =>
                              handlePreferencesUpdate(
                                "autoSaveReceipts",
                                e.target.checked
                              )
                            }
                          />
                        </label>
                      </div>

                      {/* Data Export */}
                      <div className="card bg-base-200">
                        <div className="card-body">
                          <h3 className="card-title text-base">Data Export</h3>
                          <p className="text-sm text-base-content/70 mb-4">
                            Download a copy of your personal data including
                            orders, measurements, and preferences.
                          </p>
                          <button className="btn btn-outline btn-sm">
                            <DownloadIcon size={16} className="mr-2" />
                            Export My Data
                          </button>
                        </div>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="card bg-base-200">
                        <div className="card-body">
                          <h3 className="card-title text-base">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-base-content/70 mb-4">
                            Add an extra layer of security to your account.
                          </p>
                          <button className="btn btn-outline btn-sm">
                            <ShieldCheckIcon size={16} className="mr-2" />
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "account" && (
                  <div>
                    <h2 className="card-title mb-6">Account Management</h2>

                    <div className="space-y-6">
                      {/* Account Information */}
                      <div className="card bg-base-200">
                        <div className="card-body">
                          <h3 className="card-title text-base">
                            Account Information
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Email:</span>{" "}
                              {user.email}
                            </div>
                            <div>
                              <span className="font-medium">Role:</span>{" "}
                              {user.role || "User"}
                            </div>
                            <div>
                              <span className="font-medium">Member Since:</span>{" "}
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "Unknown"}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>{" "}
                              <span className="badge badge-success badge-sm">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Change Password */}
                      <div className="card bg-base-200">
                        <div className="card-body">
                          <h3 className="card-title text-base">Password</h3>
                          <p className="text-sm text-base-content/70 mb-4">
                            Update your password to keep your account secure.
                          </p>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => (window.location.href = "/profile")}
                          >
                            <EyeIcon size={16} className="mr-2" />
                            Change Password
                          </button>
                        </div>
                      </div>

                      {/* Session Management */}
                      <div className="card bg-base-200">
                        <div className="card-body">
                          <h3 className="card-title text-base">
                            Active Sessions
                          </h3>
                          <p className="text-sm text-base-content/70 mb-4">
                            Manage where you're signed in to FashionSmith.
                          </p>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => logout()}
                          >
                            <ArrowSquareRightIcon size={16} className="mr-2" />
                            Sign Out All Devices
                          </button>
                        </div>
                      </div>

                      <div className="divider"></div>

                      {/* Danger Zone */}
                      <div className="card bg-error/10 border border-error/20">
                        <div className="card-body">
                          <h3 className="card-title text-base text-error">
                            Danger Zone
                          </h3>
                          <p className="text-sm text-base-content/70 mb-4">
                            Once you delete your account, there is no going
                            back. Please be certain.
                          </p>
                          <button
                            className="btn btn-error btn-outline btn-sm"
                            onClick={handleDeleteAccount}
                            disabled={deleteAccountMutation.isPending}
                          >
                            {deleteAccountMutation.isPending ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              <>
                                <TrashIcon size={16} className="mr-2" />
                                Delete Account
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
