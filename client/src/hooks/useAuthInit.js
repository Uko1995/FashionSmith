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
        // Add debugging for production
        if (import.meta.env.PROD) {
          console.log('Auth init starting, API URL:', import.meta.env.VITE_API_URL);
        }

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

          // Add timeout to prevent infinite hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          try {
            const response = await apiClient.get("/api/users/auth-check", {
              signal: controller.signal,
              timeout: 10000,
            });
            clearTimeout(timeoutId);

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
            if (import.meta.env.PROD) {
              console.log('Auth check failed:', authError.message);
            }
            setIsLoggedIn(false);
            setUser(null);
            setAuthProvider(null);
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        // Main error handler for the entire function
        if (import.meta.env.PROD) {
          console.log('Auth initialization error:', error.message);
        }
        setIsLoggedIn(false);
        setUser(null);
        setAuthProvider(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      } finally {
        // Always set initialization as complete
        if (import.meta.env.PROD) {
          console.log('Auth initialization complete');
        }
        setIsAuthInitialized(true);
      }
    };

    checkAuthStatus();
  }, [setIsLoggedIn, setUser, setIsAuthInitialized, setAuthProvider]);
};
