import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../services/api";
import {
  Package,
  Clock,
  CheckCircle,
  CurrencyDollar,
  Plus,
  Ruler,
  ClockCounterClockwise,
  Gear,
  CalendarCheck,
  Star,
} from "@phosphor-icons/react";

export default function DashboardOverview() {
  const navigate = useNavigate();

  // Fetch dashboard data using react-query
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: dashboardAPI.getOverview,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <div className="text-error text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
        <p className="text-base-content/60 mb-4">
          {error.response?.data?.message || "Something went wrong"}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = dashboardData?.statistics || {};
  const user = dashboardData?.user || {};
  const recentOrders = dashboardData?.recentOrders || [];
  const quickActions = dashboardData?.quickActions || [];
  const recommendations = dashboardData?.recommendations || [];

  const statsCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders || 0,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders || 0,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders || 0,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Spent",
      value: `₦${(stats.totalSpent || 0).toLocaleString()}`,
      icon: CurrencyDollar,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "badge-warning";
      case "in progress":
        return "badge-info";
      case "ready":
        return "badge-success";
      case "delivered":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-primary-content">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {user.firstName || user.username}! 👋
            </h1>
            <p className="opacity-90">
              {user.isVerified ? (
                "Your account is verified and ready to go!"
              ) : (
                <span className="flex items-center gap-2">
                  <span>Please verify your email to unlock all features</span>
                  <button className="btn btn-sm btn-warning">
                    Verify Now
                  </button>
                </span>
              )}
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="stats shadow bg-base-100/10 backdrop-blur-sm">
              <div className="stat">
                <div className="stat-figure text-primary-content">
                  <CalendarCheck size={32} />
                </div>
                <div className="stat-title text-primary-content/70">Member Since</div>
                <div className="stat-value text-primary-content text-lg">
                  {user.memberSince ? new Date(user.memberSince).getFullYear() : "2024"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card bg-base-100 shadow-sm border border-base-300">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon size={24} className={stat.color} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const getActionIcon = (iconName) => {
                    switch (iconName) {
                      case "plus":
                        return Plus;
                      case "ruler":
                        return Ruler;
                      case "history":
                        return ClockCounterClockwise;
                      case "settings":
                        return Gear;
                      default:
                        return Plus;
                    }
                  };
                  
                  const Icon = getActionIcon(action.icon);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => navigate(action.link)}
                      className="w-full p-3 text-left rounded-lg border border-base-300 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon size={16} className="text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-xs text-base-content/60 truncate">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-lg">Recent Orders</h3>
                <button
                  onClick={() => navigate("/dashboard/orders")}
                  className="btn btn-sm btn-ghost"
                >
                  View All
                </button>
              </div>
              
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto text-base-content/30 mb-4" />
                  <p className="text-base-content/60 mb-4">No orders yet</p>
                  <button
                    onClick={() => navigate("/order/new")}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={16} />
                    Create First Order
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map((order, index) => (
                    <div
                      key={order.id || index}
                      className="flex items-center justify-between p-3 rounded-lg border border-base-300 hover:bg-base-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-lg w-10 h-10">
                            <Package size={20} />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {order.garment || "Custom Garment"}
                          </p>
                          <p className="text-xs text-base-content/60">
                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "Recently"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`badge badge-sm ${getStatusColor(order.status)}`}>
                          {order.status || "Pending"}
                        </div>
                        <p className="text-xs text-base-content/60 mt-1">
                          ₦{(order.totalCost || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-lg flex items-center gap-2">
                <Star size={20} className="text-warning" />
                Recommended for You
              </h3>
              <button
                onClick={() => navigate("/gallery")}
                className="btn btn-sm btn-ghost"
              >
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((product, index) => (
                <div
                  key={product.id || index}
                  className="card card-compact bg-base-100 border border-base-300 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <figure className="h-32 bg-base-200">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package size={32} className="text-base-content/30" />
                      </div>
                    )}
                  </figure>
                  <div className="card-body p-3">
                    <h4 className="text-sm font-medium truncate">{product.name}</h4>
                    <p className="text-xs text-base-content/60">{product.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold">
                        ₦{(product.price || 0).toLocaleString()}
                      </span>
                      <button className="btn btn-xs btn-primary">
                        Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
