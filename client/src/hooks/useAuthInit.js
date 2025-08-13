import { useEffect } from "react";

import { useUiStore } from "../store/uiStore";
import apiClient from "../utils/axiosConfig";

export const useAuthInit = () => {
  const { setIsLoggedIn, setUser, setIsAuthInitialized } = useUiStore();

  useEffect(() => {
    console.log("[AUTH INIT] Checking authentication status from cookies...");

    const checkAuthStatus = async () => {
      try {
        // Simple auth check endpoint that only verifies cookies
        const response = await apiClient.get("/api/users/auth-check");

        if (
          response.status === 200 &&
          response.data.message === "Authenticated"
        ) {
          console.log("[AUTH INIT] User is authenticated");
          setIsLoggedIn(true);

          // Get user data from localStorage if available (stored during login)
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
              console.log("[AUTH INIT] User data restored from localStorage");
            } catch (error) {
              console.error(
                "[AUTH INIT] Error parsing saved user data:",
                error
              );
            }
          }
        } else {
          console.log("[AUTH INIT] User is not authenticated");
          setIsLoggedIn(false);
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("[AUTH INIT] Auth check failed:", error);
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        // Always set initialization as complete
        setIsAuthInitialized(true);
      }
    };

    checkAuthStatus();
  }, [setIsLoggedIn, setUser, setIsAuthInitialized]);
};
