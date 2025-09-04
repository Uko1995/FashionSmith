import { useEffect } from "react";

import { useUiStore } from "../store/uiStore";
import apiClient from "../utils/axiosConfig";
import { decodeJWT } from "../utils/jwtDecoder";

export const useAuthInit = () => {
  const { setIsLoggedIn, setUser, setIsAuthInitialized, setAuthProvider } =
    useUiStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Add comprehensive debugging for production
        console.log("=== AUTH INIT DEBUG ===");
        console.log("Environment:", import.meta.env.MODE);
        console.log("Is Production:", import.meta.env.PROD);
        console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
        console.log("Axios baseURL:", apiClient.defaults.baseURL);
        console.log("=======================");

        // Check if we have a JWT token (Google OAuth)
        const authToken = localStorage.getItem("authToken");

        if (authToken) {
          // For Google OAuth users, set Authorization header and auth provider
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${authToken}`;
          setAuthProvider("google");
          // Try to get user data from localStorage first
          let userData = null;
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              userData = JSON.parse(savedUser);
            } catch {
              // Error parsing saved user data
            }
          }

          // If no user data in localStorage, decode from JWT token
          if (!userData) {
            try {
              const decodedToken = decodeJWT(authToken);
              if (decodedToken) {
                userData = {
                  _id: decodedToken.id,
                  email: decodedToken.email,
                  firstName: decodedToken.firstName,
                  lastName: decodedToken.lastName,
                  username: decodedToken.username,
                  role: decodedToken.role,
                  profileImage: decodedToken.profileImage,
                  authProvider: decodedToken.authProvider,
                };
                // Save decoded user data to localStorage
                localStorage.setItem("user", JSON.stringify(userData));
              }
            } catch {
              // Error decoding JWT token
            }
          }

          if (userData) {
            setUser(userData);
            setIsLoggedIn(true);
          }
        } else {
          // For regular users, check cookies and clear any Google OAuth headers
          delete apiClient.defaults.headers.common["Authorization"];

          // Test basic connectivity first
          console.log("Testing API connectivity...");

          // Add timeout to prevent infinite hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log("Auth check timeout after 10 seconds");
            controller.abort();
          }, 10000); // 10 second timeout

          try {
            console.log(
              "Making auth-check request to:",
              `${apiClient.defaults.baseURL}/api/users/auth-check`
            );
            const response = await apiClient.get("/api/users/auth-check", {
              signal: controller.signal,
              timeout: 10000,
            });
            clearTimeout(timeoutId);
            console.log("Auth check response:", response.status, response.data);

            if (
              response.status === 200 &&
              response.data.message === "Authenticated"
            ) {
              setIsLoggedIn(true);
              setAuthProvider("local");

              // Get user data from localStorage if available
              const savedUser = localStorage.getItem("user");
              if (savedUser) {
                try {
                  setUser(JSON.parse(savedUser));
                } catch {
                  // Error parsing saved user data
                }
              }
            } else {
              setIsLoggedIn(false);
              setUser(null);
              setAuthProvider(null);
              localStorage.removeItem("user");
            }
          } catch (authError) {
            clearTimeout(timeoutId);
            // Auth check failed - treat as not logged in
            console.error("Auth check failed:", {
              message: authError.message,
              status: authError.response?.status,
              data: authError.response?.data,
              code: authError.code,
            });
            setIsLoggedIn(false);
            setUser(null);
            setAuthProvider(null);
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        // Main error handler for the entire function
        console.error("Auth initialization error:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        setIsLoggedIn(false);
        setUser(null);
        setAuthProvider(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      } finally {
        // Always set initialization as complete
        console.log(
          "Auth initialization complete - setting isAuthInitialized to true"
        );
        setIsAuthInitialized(true);
      }
    };

    checkAuthStatus();
  }, [setIsLoggedIn, setUser, setIsAuthInitialized, setAuthProvider]);
};
