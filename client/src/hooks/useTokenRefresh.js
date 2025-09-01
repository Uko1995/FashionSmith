import { useEffect, useCallback } from "react";
import { refreshAccessToken } from "../services/tokenService";
import { useUiStore } from "../store/uiStore";

export const useTokenRefresh = () => {
  const isLoggedIn = useUiStore((state) => state.isLoggedIn);
  const authProvider = useUiStore((state) => state.authProvider);
  const clearAuth = useUiStore((state) => state.clearAuth);

  const handleAuthLogout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const attemptRefresh = useCallback(async () => {
    if (!isLoggedIn) return;

    // Skip token refresh for Google OAuth users (they use JWT tokens)
    if (authProvider === "google") {
      console.log("[TOKEN REFRESH] Skipping refresh for Google OAuth user");
      return;
    }

    try {
      const result = await refreshAccessToken();
      if (!result.success) {
        console.log("Token refresh failed, logging out");
        handleAuthLogout();
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      handleAuthLogout();
    }
  }, [isLoggedIn, authProvider, handleAuthLogout]);

  useEffect(() => {
    // Listen for logout events from axios interceptor
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [handleAuthLogout]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Skip token refresh for Google OAuth users
    if (authProvider === "google") {
      console.log(
        "[TOKEN REFRESH] Skipping interval setup for Google OAuth user"
      );
      return;
    }

    // Refresh token every 14 minutes (access token expires in 15 minutes)
    const interval = setInterval(attemptRefresh, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, authProvider, attemptRefresh]);

  return { attemptRefresh };
};
