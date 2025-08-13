/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  House,
  User,
  Package,
  Ruler,
  ClockCounterClockwise,
  CreditCard,
  MapPin,
  Gear,
  List,
  Bell,
  // ChartBar,
  SignOut,
  // Menu,
  X,
  Plus,
  Clock,
  CheckCircle,
  CurrencyDollar,
  CalendarCheck,
  // Star,
} from "@phosphor-icons/react";

import { dashboardAPI } from "../services/api";
import SVGFallback from "../components/SVGFallBack";
import useLogoutWithNav from "../hooks/useLogoutWithNav";
// import useUiStore from "../store/uiStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useLogoutWithNav();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sidebar navigation items
  const sidebarItems = [
    {
      title: "Overview",
      icon: House,
      path: "/dashboard",
      isActive: location.pathname === "/dashboard",
    },
    {
      title: "Profile",
      icon: User,
      path: "/dashboard/profile",
      isActive: location.pathname === "/dashboard/profile",
    },
    {
      title: "My Orders",
      icon: Package,
      path: "/dashboard/orders",
      isActive: location.pathname === "/dashboard/orders",
    },
    {
      title: "Measurements",
      icon: Ruler,
      path: "/dashboard/measurements",
      isActive: location.pathname === "/dashboard/measurements",
    },
    {
      title: "Order History",
      icon: ClockCounterClockwise,
      path: "/dashboard/history",
      isActive: location.pathname === "/dashboard/history",
    },
    {
      title: "Payments",
      icon: CreditCard,
      path: "/dashboard/payments",
      isActive: location.pathname === "/dashboard/payments",
    },
    {
      title: "Track Order",
      icon: MapPin,
      path: "/dashboard/track",
      isActive: location.pathname === "/dashboard/track",
    },
    {
      title: "Notifications",
      icon: Bell,
      path: "/dashboard/notifications",
      isActive: location.pathname === "/dashboard/notifications",
    },
    {
      title: "Settings",
      icon: Gear,
      path: "/dashboard/settings",
      isActive: location.pathname === "/dashboard/settings",
    },
  ];

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (

  //Extract data from API response
  console.log("Dashboard user Data:", data);
  const stats = data?.data?.data?.statistics || {};
  console.log("stats", stats);
  const userData = data?.data?.data?.user || {};
  console.log("userData", userData);

  const recentOrders = data?.data?.data?.recentOrders || [];
  console.log("recentOrders", recentOrders);
  const quickActions = data?.data?.data?.quickActions || [];
  console.log("quickActions", quickActions);
  const recommendations = data?.data?.data?.recommendations || [];
  console.log("recommendations", recommendations);

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
    <div className="flex h-screen bg-base-200">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-base-100 shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-base-300">
          <h2 className="text-xl font-bold text-primary">FashionSmith</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden btn btn-ghost btn-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col h-fit">
          {/* User Profile Section */}
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center space-x-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="text-sm">
                    {userData.firstName?.charAt(0) ||
                      userData.username?.charAt(0) ||
                      "U"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Welcome User
                </p>
                <p className="text-xs text-base-content/60 truncate">
                  Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                    item.isActive
                      ? "bg-primary text-primary-content"
                      : "text-base-content hover:bg-base-200"
                  }`}
                >
                  <Icon size={18} className="mr-3" />
                  {item.title}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-base-300">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-1 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
            >
              <SignOut size={18} className="mr-3" />
              Logout
            </button>
            {/* Admin Button - Remove for now */}
            {/* {userData.role === "admin" && (
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-extrabold text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <SignOut size={18} className="mr-3" />
                ADMIN
              </button>
            )} */}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-base-100 border-b border-base-300 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn btn-ghost btn-sm"
            >
              <List size={20} />
            </button>
          </div>
        </header>

        {/*dashboard content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
            {/* Welcome header */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-primary-content ">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                    Welcome back, {userData.username || userData.firstName}! 👋
                  </h1>
                  <p className="opacity-90">
                    {userData.isVerified ? (
                      "Your account is verified and ready to go!"
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>
                          Please verify your email to unlock all features.
                        </span>
                        <button className="btn btn-sm btn-primary">
                          Verify Now
                        </button>
                      </span>
                    )}
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="stat shadow bg-base-100/10 backdrop-blur-sm">
                    <div className="stat">
                      <div className="stat-value text-primary-content">
                        <CalendarCheck size={32} />
                      </div>
                      <div className="stat-value text-primary-content/70">
                        Member Since
                      </div>
                      <div className="stat-value text-primary-content text-lg">
                        {userData.memberSince
                          ? new Date(userData.memberSince).getFullYear()
                          : "2025"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Stat grid */}
            <div className="grid gird-cols-1 md:grid-cols-2 lg:grid-cols-3 gpa-4">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="card bg-base-100 shadow-sm border border-base-300"
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-base-content/60 mb-1">
                            {stat.title}
                          </p>
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
            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* quick actions */}
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
                            className="w-full p-3 cursor-pointer text-left rounded-lg border border-base-300 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Icon size={16} className="text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                  {action.title}
                                </p>
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
                        className="btn btn-sm btn-ghost"
                        onClick={() => navigate("/dashboard/orders")}
                      >
                        View All
                      </button>
                    </div>

                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package
                          size={48}
                          className="mx-auto text-base-content/30 mb-4"
                        />
                        <p className="text-base-content/60 mb-4">
                          No orders yet
                        </p>
                        <button className="btn btn-sm btn-primary">
                          {" "}
                          <Plus size={16} /> Create first Order
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
                                <p className="text-xs text-base-content/60">
                                  {order.orderDate
                                    ? new Date(
                                        order.orderDate
                                      ).toLocaleDateString()
                                    : "Recently"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`badge badge-sm ${getStatusColor(
                                  order.status
                                )}`}
                              >
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
                      Recommendations
                    </h3>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => navigate("/gallery")}
                    >
                      View All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recommendations.map((product, index) => (
                      <div
                        key={product.id || index}
                        className="card card-compact bg-base-100 border border-base-300 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <figure className="h-32 bg-base-200">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className=" h-full flex items-center justify-center">
                              <Package
                                size={32}
                                className="text-base-content/30"
                              />
                            </div>
                          )}
                        </figure>
                        <div className="card-body p-3">
                          <h4 className="text-sm font-medium truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-base-content/60">
                            {product.category}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-semibold">
                              ₦{product.price.toLocaleString()}
                            </span>
                            <button className="btn btn-xs btn-primary">
                              Add to Cart
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
        </main>
      </div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
