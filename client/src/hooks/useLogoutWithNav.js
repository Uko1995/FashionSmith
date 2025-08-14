import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "../store/uiStore";
import toast from "react-hot-toast";
import apiClient from "../utils/axiosConfig";
import { shouldRedirectToLogin } from "../utils/routeUtils";

// This version of useLogout is for components inside Router context
export default function useLogoutWithNav() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { resetAuthState } = useUiStore();
  const navigate = useNavigate();

  const logout = async (forced = false) => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    console.log(
      `[LOGOUT] ${forced ? "Forced logout" : "User logout"} initiated`
    );

    try {
      if (!forced) {
        // Only attempt server logout if this isn't a forced logout
        console.log("[LOGOUT] Attempting server logout...");
        await apiClient.post("/api/users/logout");
        console.log("[LOGOUT] Server logout successful");
        toast.success("Logged out successfully!");
      } else {
        console.log("[LOGOUT] Forced logout - skipping server call");
        toast.error("Session expired. Please log in again.");
      }
    } catch (error) {
      console.error("[LOGOUT] Server logout failed:", error);
      if (!forced) {
        toast.error("Logout failed, but clearing local session");
      }
    } finally {
      // Always clear local state regardless of server response
      console.log("[LOGOUT] Clearing local authentication state");
      resetAuthState();
      localStorage.removeItem("user");

      // Emit logout event for other components
      window.dispatchEvent(new CustomEvent("auth:logout"));

      setIsLoggingOut(false);

      // Only redirect to login if user is currently on a protected route
      if (shouldRedirectToLogin()) {
        console.log(
          "[LOGOUT] User was on protected route, redirecting to login"
        );
        navigate("/login", { replace: true });
      } else {
        console.log(
          "[LOGOUT] User was on public route, staying on current page"
        );
        // Stay on current page - no redirect needed
        // The navbar will update automatically due to state change
      }
    }
  };

  // New function for forced logout scenarios
  const forceLogout = () => logout(true);

  return { logout, forceLogout, isLoggingOut };
}
