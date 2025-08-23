import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../services/api";
import { getProfileImageUrl, getUserInitials } from "../utils/imageUtils";
import {
  UsersIcon,
  ShoppingBagIcon,
  CurrencyCircleDollarIcon,
  ChartBarIcon,
  HouseIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  //fetch admin stats
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: adminAPI.getDashboardStats,
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });

  // fetch all users
  const {
    data: users,
    // isLoading: isLoadingUsers,
    // error: errorUsers,
  } = useQuery({
    queryKey: ["allUsers"],
    queryFn: adminAPI.getUsers,
  });

  // fetch all orders
  const { data: orders } = useQuery({
    queryKey: ["allOrders"],
    queryFn: adminAPI.getAllOrders,
  });

  const AllUsers = users?.data?.data || [];
  const AllOrders = orders?.data?.data || [];
  console.log("all orders:", AllOrders);

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.data?.data?.totalUsers || 0,
      icon: UsersIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Orders",
      value: stats?.data?.data?.totalOrders || 0,
      icon: ShoppingBagIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Revenue",
      value: `₦${(stats?.data?.data?.totalRevenue || 0).toLocaleString()}`,
      icon: CurrencyCircleDollarIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Orders",
      value: stats?.data?.data?.pendingOrders || 0,
      icon: ChartBarIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading dashboard data: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Admin Dashboard
          </h1>
          <p className="text-base-content/60 mt-2">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="btn btn-outline btn-primary gap-2 self-start sm:self-auto"
        >
          <HouseIcon className="h-5 w-5" />
          Back to Home
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base-content/60 text-sm font-medium">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-base-content mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-lg font-semibold">Recent Orders</h2>
            <div className="space-y-3 mt-4">
              {stats?.data?.data?.recentOrders?.length > 0 &&
              AllOrders?.length > 0 ? (
                AllOrders?.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-base-content">
                        Order #{order._id.slice(-6)}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {order.user?.username || "Unknown User"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-base-content">
                        ₦{order.totalAmount?.toLocaleString()}
                      </p>
                      <span
                        className={`badge badge-sm ${
                          order.status === "completed"
                            ? "badge-success"
                            : order.status === "pending"
                            ? "badge-warning"
                            : "badge-info"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-base-content/60 text-center py-4">
                  No recent orders
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-lg font-semibold">Recent Users</h2>
            <div className="space-y-3 mt-4">
              {stats?.data?.data?.totalUsers > 0 && AllUsers.length > 0 ? (
                AllUsers.slice(0, 5).map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          {user?.profileImage ? (
                            <img
                              src={getProfileImageUrl(user.profileImage)}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('Dashboard image failed to load:', user.profileImage);
                                // Hide the img and show fallback
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center"
                            style={{ display: user?.profileImage ? 'none' : 'flex' }}
                          >
                            <span className="text-sm">
                              {getUserInitials(user)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-base-content">
                          {user.username}
                        </p>
                        <p className="text-sm text-base-content/60">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`badge ${
                          user.isVerified ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-base-content/60 text-center py-4">
                  No recent users
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-lg font-semibold mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("products")}
              className="btn btn-primary btn-outline"
            >
              Add New Product
            </button>
            <button
              onClick={() => navigate("orders")}
              className="btn btn-secondary btn-outline"
            >
              View All Orders
            </button>
            <button
              onClick={() => navigate("users")}
              className="btn btn-accent btn-outline"
            >
              Manage Users
            </button>
            <button className="btn btn-info btn-outline">Export Data</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
