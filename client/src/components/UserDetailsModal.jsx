import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  XIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  RulerIcon,
  BellIcon,
  // TrendUpIcon,
} from "@phosphor-icons/react";

import { adminAPI } from "../services/api";
import { getProfileImageUrl, getUserInitials } from "../utils/imageUtils";

const UserDetailsModal = ({ userId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: userDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userDetails", userId],
    queryFn: () => adminAPI.getUserDetails(userId),
    enabled: isOpen && !!userId,
  });

  console.log("user details modal:", userDetails);

  const user = userDetails?.data?.data?.user || {};
  const orders = userDetails?.data?.data?.orders || [];
  const measurements = userDetails?.data?.data?.measurements || [];

  const payments = userDetails?.data?.data?.payments || [];
  const notifications = userDetails?.data?.data?.notifications || [];
  const stats = userDetails?.data?.data?.statistics || {};

  if (!isOpen) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "orders", label: "Orders", icon: ShoppingBagIcon },
    { id: "measurements", label: "Measurements", icon: RulerIcon },
    { id: "payments", label: "Payments", icon: CurrencyDollarIcon },
    { id: "activity", label: "Activity", icon: BellIcon },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={getProfileImageUrl(user.profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('Image failed to load:', user.profileImage);
                    // Hide the img and show fallback
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
                style={{ display: user?.profileImage ? 'none' : 'flex' }}
              >
                <span className="text-sm font-bold text-blue-600">
                  {getUserInitials(user)}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isLoading ? "Loading..." : user?.username || "User Details"}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="alert alert-error">
              <span>Error loading user details: {error.message}</span>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">
                        User Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Username:
                          </span>
                          <span className="font-medium">{user?.username}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="font-medium">{user?.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">Joined:</span>
                          <span className="font-medium">
                            {formatDate(user?.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {user?.isVerified ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-red-500" />
                          )}
                          <span className="text-sm text-gray-600">Status:</span>
                          <span
                            className={`font-medium ${
                              user?.isVerified
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {user?.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">Role:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user?.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {stats.totalOrders}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Orders
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {stats.completedOrders}
                          </div>
                          <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(stats.totalSpent)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Spent
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {stats.completionRate?.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Completion Rate
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Order History ({orders.length})
                  </h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingBagIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No orders found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.productName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    order.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : order.status === "in-progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(order.totalAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "measurements" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Measurements ({measurements.length})
                  </h3>
                  {measurements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <RulerIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No measurements found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {measurements.map((measurement) => (
                        <div
                          key={measurement.id}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-lg">
                              Measurement Set
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(measurement.createdAt)}
                            </span>
                          </div>

                          {/* All measurements in a consistent grid */}
                          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-sm">
                            {/* Basic Body Measurements */}
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Neck:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.Neck || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Shoulder:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.Shoulder || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Chest:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.Chest || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Waist:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.NaturalWaist || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Hip:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.Hip || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>

                            {/* Sleeve Measurements */}
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Long Sleeve:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.LongSleeve || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Short Sleeve:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.ShortSleeve || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Mid Sleeve:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.MidSleeve || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>

                            {/* Trouser Measurements */}
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Trouser Length:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.TrouserLength || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Trouser Waist:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.TrouserWaist || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Thigh Width:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.ThighWidth || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Knee Width:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.KneeWidth || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>

                            {/* Traditional Garments */}
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Kaftan Length:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.KaftanLength || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Agbada Length:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.agbadaLength || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <span className="text-gray-600 block mb-1">
                                Waistcoat Length:
                              </span>
                              <span className="font-medium text-gray-900">
                                {measurement.waistCoatLength || "N/A"}
                                {measurement.unit || '"'}
                              </span>
                            </div>

                            {/* Suit Measurements */}
                            {measurement.SuitLength && (
                              <div className="bg-white p-3 rounded border">
                                <span className="text-gray-600 block mb-1">
                                  Suit Length:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {measurement.SuitLength}
                                  {measurement.unit || '"'}
                                </span>
                              </div>
                            )}
                            {measurement.SuitChest && (
                              <div className="bg-white p-3 rounded border">
                                <span className="text-gray-600 block mb-1">
                                  Suit Chest:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {measurement.SuitChest}
                                  {measurement.unit || '"'}
                                </span>
                              </div>
                            )}
                            {measurement.SuitWaist && (
                              <div className="bg-white p-3 rounded border">
                                <span className="text-gray-600 block mb-1">
                                  Suit Waist:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {measurement.SuitWaist}
                                  {measurement.unit || '"'}
                                </span>
                              </div>
                            )}

                            {/* Additional Measurements */}
                            {measurement.ShirtLength && (
                              <div className="bg-white p-3 rounded border">
                                <span className="text-gray-600 block mb-1">
                                  Shirt Length:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {measurement.ShirtLength}
                                  {measurement.unit || '"'}
                                </span>
                              </div>
                            )}
                            {measurement.AnkleWidth && (
                              <div className="bg-white p-3 rounded border">
                                <span className="text-gray-600 block mb-1">
                                  Ankle Width:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {measurement.AnkleWidth}
                                  {measurement.unit || '"'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "payments" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Payment History ({payments.length})
                  </h3>
                  {payments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No payments found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reference
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.map((payment) => (
                            <tr key={payment._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {payment.reference}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    payment.status === "success"
                                      ? "bg-green-100 text-green-800"
                                      : payment.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(payment.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Recent Activity ({notifications.length})
                  </h3>
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BellIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent activity found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <BellIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDetailsModal;
