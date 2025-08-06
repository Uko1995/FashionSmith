import { useEffect } from "react";
import { useUiStore } from "../store/uiStore";
import { userAPI } from "../services/api";

export const useAuthInit = () => {
  const { setIsLoggedIn, setUser, clearAuth } = useUiStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("[AUTH INIT] Checking authentication status...");
        // Try to fetch user profile to verify if user is authenticated
        const response = await userAPI.getProfile();

        if (response.data) {
          console.log("[AUTH INIT] User is authenticated:", response.data);
          setIsLoggedIn(true);
          setUser(response.data);
        }
      } catch (error) {
        console.log(
          "[AUTH INIT] User is not authenticated:",
          error.response?.status
        );
        // User is not authenticated or token is invalid
        clearAuth();
      }
    };

    checkAuthStatus();
  }, [setIsLoggedIn, setUser, clearAuth]);
};
