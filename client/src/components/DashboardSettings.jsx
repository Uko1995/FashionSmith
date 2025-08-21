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
} from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userAPI } from "../services/api";
import SEO from "./SEO";

export default function DashboardSettings() {
  const queryClient = useQueryClient();
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

  const settingsTabs = [
    { id: "measurements", label: "Measurements", icon: RulerIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "payments", label: "Payments", icon: CreditCardIcon },
    { id: "appearance", label: "Appearance", icon: PaintBrushIcon },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/70">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4 md:p-6 lg:p-8">
      <SEO
        title="Settings - FashionSmith"
        description="Manage your account settings, preferences, and privacy options."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Settings
          </h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            Customize your FashionSmith experience and manage your account
            preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-1/4">
            <div className="card bg-base-100 shadow-xl border border-base-300/50">
              <div className="card-body p-4">
                <h3 className="font-semibold text-lg mb-4">Settings</h3>
                <div className="space-y-1">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-content"
                            : "text-base-content hover:bg-base-200"
                        }`}
                      >
                        <Icon size={18} className="mr-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:w-3/4">
            {/* Measurements Tab */}
            {activeTab === "measurements" && (
              <div className="card bg-base-100 shadow-xl border border-base-300/50">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6 flex items-center">
                    <RulerIcon size={24} className="mr-2" />
                    Measurement Preferences
                  </h2>

                  <div className="space-y-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Measurement Unit
                        </span>
                      </label>
                      <div className="flex gap-4">
                        <label className="label cursor-pointer">
                          <input
                            type="radio"
                            name="measurementUnit"
                            className="radio radio-primary"
                            checked={preferences.measurementUnit === "cm"}
                            onChange={() =>
                              handlePreferencesUpdate("measurementUnit", "cm")
                            }
                          />
                          <span className="label-text ml-2">
                            Centimeters (cm)
                          </span>
                        </label>
                        <label className="label cursor-pointer">
                          <input
                            type="radio"
                            name="measurementUnit"
                            className="radio radio-primary"
                            checked={preferences.measurementUnit === "inches"}
                            onChange={() =>
                              handlePreferencesUpdate(
                                "measurementUnit",
                                "inches"
                              )
                            }
                          />
                          <span className="label-text ml-2">Inches</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">
                          <div>
                            <div className="font-semibold">
                              Measurement Reminders
                            </div>
                            <div className="text-sm text-base-content/60">
                              Get reminded to update your measurements
                              periodically
                            </div>
                          </div>
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={preferences.measurementReminders}
                          onChange={(e) =>
                            handlePreferencesUpdate(
                              "measurementReminders",
                              e.target.checked
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="card bg-base-100 shadow-xl border border-base-300/50">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6 flex items-center">
                    <BellIcon size={24} className="mr-2" />
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">
                          <div>
                            <div className="font-semibold">
                              Email Notifications
                            </div>
                            <div className="text-sm text-base-content/60">
                              Receive notifications via email
                            </div>
                          </div>
                        </span>
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

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">
                          <div>
                            <div className="font-semibold">
                              SMS Notifications
                            </div>
                            <div className="text-sm text-base-content/60">
                              Receive notifications via SMS
                            </div>
                          </div>
                        </span>
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

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">
                          <div>
                            <div className="font-semibold">Order Updates</div>
                            <div className="text-sm text-base-content/60">
                              Get notified about order status changes
                            </div>
                          </div>
                        </span>
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

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">
                          <div>
                            <div className="font-semibold">
                              Marketing Emails
                            </div>
                            <div className="text-sm text-base-content/60">
                              Receive promotional offers and updates
                            </div>
                          </div>
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
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
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="card bg-base-100 shadow-xl border border-base-300/50">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6 flex items-center">
                    <CreditCardIcon size={24} className="mr-2" />
                    Payment Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="alert alert-info">
                      <div>
                        <h3 className="font-bold">Payment Methods</h3>
                        <div className="text-sm">
                          Payment methods are managed securely through Paystack
                          during checkout. No payment information is stored on
                          our servers.
                        </div>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">
                          <div>
                            <div className="font-semibold">
                              Payment Notifications
                            </div>
                            <div className="text-sm text-base-content/60">
                              Get notified about payment confirmations and
                              receipts
                            </div>
                          </div>
                        </span>
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

                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">
                          <div>
                            <div className="font-semibold">
                              Auto-save Receipts
                            </div>
                            <div className="text-sm text-base-content/60">
                              Automatically save payment receipts to your
                              account
                            </div>
                          </div>
                        </span>
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
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="card bg-base-100 shadow-xl border border-base-300/50">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6 flex items-center">
                    <PaintBrushIcon size={24} className="mr-2" />
                    Appearance & Language
                  </h2>

                  <div className="space-y-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Theme</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="label cursor-pointer">
                          <input
                            type="radio"
                            name="theme"
                            className="radio radio-primary"
                            checked={preferences.theme === "light"}
                            onChange={() =>
                              handlePreferencesUpdate("theme", "light")
                            }
                          />
                          <span className="label-text ml-2 flex items-center gap-2">
                            <SunIcon size={16} />
                            Light
                          </span>
                        </label>
                        <label className="label cursor-pointer">
                          <input
                            type="radio"
                            name="theme"
                            className="radio radio-primary"
                            checked={preferences.theme === "dark"}
                            onChange={() =>
                              handlePreferencesUpdate("theme", "dark")
                            }
                          />
                          <span className="label-text ml-2 flex items-center gap-2">
                            <MoonIcon size={16} />
                            Dark
                          </span>
                        </label>
                        <label className="label cursor-pointer">
                          <input
                            type="radio"
                            name="theme"
                            className="radio radio-primary"
                            checked={preferences.theme === "auto"}
                            onChange={() =>
                              handlePreferencesUpdate("theme", "auto")
                            }
                          />
                          <span className="label-text ml-2 flex items-center gap-2">
                            <DeviceTabletSpeakerIcon size={16} />
                            Auto
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
