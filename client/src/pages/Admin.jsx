import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useUiStore } from "../store/uiStore";
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  PackageIcon,
  GearIcon,
  SignOutIcon,
  ListIcon,
  XIcon,
} from "@phosphor-icons/react";

const Admin = () => {
  const { user, isLoggedIn, isAuthInitialized, clearAuth } = useUiStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    console.log("[ADMIN] Auth state check:", { isLoggedIn, user, isAuthInitialized });
    console.log("[ADMIN] User role:", user?.role);
    
    // Wait for auth initialization to complete
    if (!isAuthInitialized) {
      console.log("[ADMIN] Waiting for auth initialization...");
      return;
    }
    
    if (!isLoggedIn || !user || user.role !== "admin") {
      console.log("[ADMIN] Access denied - redirecting to login");
      navigate("/login");
    }
  }, [isLoggedIn, user, isAuthInitialized, navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: ChartBarIcon,
      end: true,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: UsersIcon,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingBagIcon,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: PackageIcon,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: GearIcon,
    },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-base-content">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-base-content">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200" data-theme="business">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="btn btn-ghost btn-circle bg-base-100 shadow-lg"
        >
          <ListIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-base-100 overflow-y-auto border-r border-base-300 shadow-xl">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary">
            <h1 className="text-xl font-bold text-primary-content">
              FashionSmith Admin
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-content shadow-md"
                      : "text-base-content hover:bg-base-200 hover:text-primary"
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-base-300">
            <div className="flex items-center mb-3">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-8">
                  <span className="text-xs">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-base-content">
                  {user?.username}
                </p>
                <p className="text-xs text-base-content/60">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors duration-200"
            >
              <SignOutIcon className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeSidebar}
          ></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-base-100 shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 bg-primary">
              <h1 className="text-xl font-bold text-primary-content">
                FashionSmith Admin
              </h1>
              <button
                onClick={closeSidebar}
                className="btn btn-ghost btn-sm text-primary-content"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-content shadow-md"
                        : "text-base-content hover:bg-base-200 hover:text-primary"
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-base-300">
              <div className="flex items-center mb-3">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-8">
                    <span className="text-xs">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-base-content">
                    {user?.username}
                  </p>
                  <p className="text-xs text-base-content/60">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-colors duration-200"
              >
                <SignOutIcon className="mr-3 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="flex-1 pt-16 lg:pt-0">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom navigation for mobile and tablet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 shadow-xl z-30">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 min-w-0 flex-1 ${
                  isActive
                    ? "text-primary"
                    : "text-base-content/60 hover:text-primary"
                } transition-colors duration-200`
              }
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
