import { useState } from "react";
import {
  Gear,
  Bell,
  ShieldCheck,
  CurrencyCircleDollar,
  Globe,
  Users,
} from "@phosphor-icons/react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "FashionSmith",
    siteDescription: "Premium Bespoke Tailoring Services",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxOrdersPerUser: 10,
    defaultCurrency: "NGN",
    taxRate: 7.5,
    shippingFee: 2000,
    notifications: {
      emailOnNewOrder: true,
      emailOnPayment: true,
      smsOnOrderUpdate: false,
      pushNotifications: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
    },
  });

  const [activeTab, setActiveTab] = useState("general");

  const handleSettingChange = (section, key, value) => {
    if (section) {
      setSettings((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving settings:", settings);
  };

  const tabs = [
    { id: "general", name: "General", icon: Gear },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: ShieldCheck },
    { id: "business", name: "Business", icon: CurrencyCircleDollar },
    { id: "users", name: "Users", icon: Users },
    { id: "system", name: "System", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Settings</h1>
          <p className="text-base-content/60 mt-2">
            Manage your application settings and preferences
          </p>
        </div>
        <button onClick={handleSave} className="btn btn-primary">
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-0">
              <ul className="menu">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-3 ${
                        activeTab === tab.id ? "active" : ""
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">General Settings</h2>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Site Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={settings.siteName}
                      onChange={(e) =>
                        handleSettingChange(null, "siteName", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Site Description</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      value={settings.siteDescription}
                      onChange={(e) =>
                        handleSettingChange(null, "siteDescription", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Maintenance Mode</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={settings.maintenanceMode}
                        onChange={(e) =>
                          handleSettingChange(null, "maintenanceMode", e.target.checked)
                        }
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Notification Settings</h2>
                  
                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Email on New Order</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={settings.notifications.emailOnNewOrder}
                        onChange={(e) =>
                          handleSettingChange("notifications", "emailOnNewOrder", e.target.checked)
                        }
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Email on Payment</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={settings.notifications.emailOnPayment}
                        onChange={(e) =>
                          handleSettingChange("notifications", "emailOnPayment", e.target.checked)
                        }
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">SMS on Order Update</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={settings.notifications.smsOnOrderUpdate}
                        onChange={(e) =>
                          handleSettingChange("notifications", "smsOnOrderUpdate", e.target.checked)
                        }
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Push Notifications</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) =>
                          handleSettingChange("notifications", "pushNotifications", e.target.checked)
                        }
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Security Settings</h2>
                  
                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Two-Factor Authentication</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) =>
                          handleSettingChange("security", "twoFactorAuth", e.target.checked)
                        }
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Session Timeout (minutes)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Max Login Attempts</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) =>
                        handleSettingChange("security", "maxLoginAttempts", parseInt(e.target.value))
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Lockout Duration (minutes)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={settings.security.lockoutDuration}
                      onChange={(e) =>
                        handleSettingChange("security", "lockoutDuration", parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "business" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Business Settings</h2>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Default Currency</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={settings.defaultCurrency}
                      onChange={(e) =>
                        handleSettingChange(null, "defaultCurrency", e.target.value)
                      }
                    >
                      <option value="NGN">Nigerian Naira (NGN)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Tax Rate (%)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered"
                      value={settings.taxRate}
                      onChange={(e) =>
                        handleSettingChange(null, "taxRate", parseFloat(e.target.value))
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Shipping Fee (₦)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={settings.shippingFee}
                      onChange={(e) =>
                        handleSettingChange(null, "shippingFee", parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">User Settings</h2>
                  
                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Allow User Registration</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={settings.allowRegistration}
                        onChange={(e) =>
                          handleSettingChange(null, "allowRegistration", e.target.checked)
                        }
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Require Email Verification</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={settings.requireEmailVerification}
                        onChange={(e) =>
                          handleSettingChange(null, "requireEmailVerification", e.target.checked)
                        }
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Max Orders Per User</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={settings.maxOrdersPerUser}
                      onChange={(e) =>
                        handleSettingChange(null, "maxOrdersPerUser", parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "system" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">System Information</h2>
                  
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">App Version</div>
                      <div className="stat-value text-primary">v2.1.0</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Database</div>
                      <div className="stat-value text-secondary">MongoDB</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Server</div>
                      <div className="stat-value text-accent">Node.js</div>
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <div>
                      <h3 className="font-bold">Backup Information</h3>
                      <div className="text-xs">Last backup: Today at 2:00 AM</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="btn btn-outline">
                      Export Data
                    </button>
                    <button className="btn btn-outline">
                      Clear Cache
                    </button>
                    <button className="btn btn-outline btn-warning">
                      Restart Server
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
