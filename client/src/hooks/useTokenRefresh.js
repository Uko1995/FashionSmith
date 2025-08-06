import { useEffect, useCallback } from "react";
import { refreshAccessToken } from "../services/tokenService";
import { useUiStore } from "../store/uiStore";

export const useTokenRefresh = () => {
  const isLoggedIn = useUiStore((state) => state.isLoggedIn);
  const clearAuth = useUiStore((state) => state.clearAuth);

  const handleAuthLogout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const attemptRefresh = useCallback(async () => {
    if (!isLoggedIn) return;

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
  }, [isLoggedIn, handleAuthLogout]);

  useEffect(() => {
    // Listen for logout events from axios interceptor
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [handleAuthLogout]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Refresh token every 14 minutes (access token expires in 15 minutes)
    const interval = setInterval(attemptRefresh, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, attemptRefresh]);

  return { attemptRefresh };
};
