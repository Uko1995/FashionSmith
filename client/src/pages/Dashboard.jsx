/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import {
  HouseIcon,
  UserIcon,
  RulerIcon,
  ClockCounterClockwiseIcon,
  CreditCardIcon,
  MapPinIcon,
  GearIcon,
  ListIcon,
  BellIcon,
  // ChartBar,
  SignOut,
  // Menu,
  XIcon,
  PlusIcon,
  CurrencyDollarIcon,
  CalendarCheckIcon,
  SignOutIcon,
  UserGearIcon,
  CheckCircleIcon,
  PackageIcon,
  ClockIcon,
  // Star,
} from "@phosphor-icons/react";

import { dashboardAPI } from "../services/api";
import SVGFallback from "../components/SVGFallBack";
import useLogoutWithNav from "../hooks/useLogoutWithNav";
import FashionSmithLogo from "../components/FashionSmithLogo";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useLogoutWithNav();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // This will trigger an API call that tests authentication
  // and automatically refresh tokens when they expire
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: dashboardAPI.getOverview,
    refetchInterval: 20 * 60 * 1000, // Refetch every 20 minutes
  });

  // Sidebar navigation items
  const sidebarItems = [
    {
      title: "Overview",
      icon: HouseIcon,
      path: "/dashboard",
      isActive: location.pathname === "/dashboard",
    },
    {
      title: "Profile",
      icon: UserIcon,
      path: "/dashboard/profile",
      isActive: location.pathname === "/dashboard/profile",
    },
    {
      title: "My Orders",
      icon: PackageIcon,
      path: "/dashboard/orders",
      isActive: location.pathname === "/dashboard/orders",
    },
    {
      title: "Measurements",
      icon: RulerIcon,
      path: "/dashboard/measurements",
      isActive: location.pathname === "/dashboard/measurements",
    },
    {
      title: "Payments",
      icon: CreditCardIcon,
      path: "/dashboard/payments",
      isActive: location.pathname === "/dashboard/payments",
    },
    {
      title: "Notifications",
      icon: BellIcon,
      path: "/dashboard/notifications",
      isActive: location.pathname === "/dashboard/notifications",
    },
    {
      title: "Settings",
      icon: GearIcon,
      path: "/dashboard/settings",
      isActive: location.pathname === "/dashboard/settings",
    },
  ];

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (isLoading) {
    return <SVGFallback />;
  }

  if (error) {
    console.log("Dashboard Error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <div className="text-error text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold mb-2">Dashboard Error</h3>
        <p className="text-base-content/60 mb-4">
          {error.response?.data?.message || "Failed to load dashboard data"}
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
      icon: PackageIcon,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders || 0,
      icon: ClockIcon,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders || 0,
      icon: CheckCircleIcon,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Spent",
      value: `₦${(stats.totalSpent || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
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
          <Link
            to="/"
            className=" transition-all duration-200 scale-105 p-2 -m-2"
            aria-label="FashionSmith Home"
          >
            <FashionSmithLogo className="h-8 w-auto sm:h-10 md:h-12 lg:h-60 -ms-11 transition-all duration-200" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden btn btn-ghost btn-sm"
          >
            <XIcon size={20} />
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
                  {userData.username || userData.firstName || "User"}
                </p>
                <p className="text-xs text-base-content/60 truncate">
                  {userData.email}
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
          <div className="p-4 border-t mt-28 border-base-300">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-1 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
            >
              <SignOutIcon size={18} className="mr-3" />
              Logout
            </button>
            {/* Admin Button */}
            {userData.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center w-full px-3 py-2 text-sm font-bold text-error hover:bg-error/10 rounded-lg transition-colors"
              >
                <UserGearIcon size={18} className="mr-3" />
                ADMIN
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile Header */}

        {/*dashboard content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
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
