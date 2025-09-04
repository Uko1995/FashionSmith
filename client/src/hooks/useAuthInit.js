import { useEffect } from "react";

import { useUiStore } from "../store/uiStore";
import apiClient from "../utils/axiosConfig";
import { decodeJWT } from "../utils/jwtDecoder";

export const useAuthInit = () => {
  const { setIsLoggedIn, setUser, setIsAuthInitialized, setAuthProvider } =
    useUiStore();

  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log("=== SIMPLE AUTH INIT DEBUG ===");
      console.log("Starting auth initialization...");

      // Immediately set as initialized to prevent infinite loading
      setIsAuthInitialized(true);
      console.log("Auth initialization set to true");

      try {
        // Add debugging for environment
        console.log("Environment:", import.meta.env.MODE);
        console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
        console.log("Axios baseURL:", apiClient.defaults.baseURL);

        // Check if we have a JWT token (Google OAuth)
        const authToken = localStorage.getItem("authToken");

        if (authToken) {
          console.log("Found authToken, setting up Google OAuth user");
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${authToken}`;
          setAuthProvider("google");

          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              setUser(userData);
              setIsLoggedIn(true);
              console.log("Google OAuth user authenticated from localStorage");
              return;
            } catch (error) {
              console.log("Error parsing saved user data:", error);
            }
          }

          // Try to decode from JWT token
          try {
            const decodedToken = decodeJWT(authToken);
            if (decodedToken) {
              const userData = {
                _id: decodedToken.id,
                email: decodedToken.email,
                firstName: decodedToken.firstName,
                lastName: decodedToken.lastName,
                username: decodedToken.username,
                role: decodedToken.role,
                profileImage: decodedToken.profileImage,
                authProvider: decodedToken.authProvider,
              };
              localStorage.setItem("user", JSON.stringify(userData));
              setUser(userData);
              setIsLoggedIn(true);
              console.log("Google OAuth user authenticated from JWT token");
              return;
            }
          } catch (error) {
            console.log("Error decoding JWT token:", error);
          }
        } else {
          console.log("No authToken found, checking cookie authentication");
          delete apiClient.defaults.headers.common["Authorization"];

          // Quick auth check with short timeout
          try {
            const response = await apiClient.get("/api/users/auth-check", {
              timeout: 3000,
            });

            console.log("Auth check response:", response.status, response.data);

            if (
              response.status === 200 &&
              response.data.message === "Authenticated"
            ) {
              setIsLoggedIn(true);
              setAuthProvider("local");

              const savedUser = localStorage.getItem("user");
              if (savedUser) {
                try {
                  setUser(JSON.parse(savedUser));
                } catch (error) {
                  console.log("Error parsing saved user:", error);
                }
              }
              console.log("Cookie authentication successful");
            } else {
              setIsLoggedIn(false);
              setUser(null);
              setAuthProvider(null);
              localStorage.removeItem("user");
              console.log("Not authenticated via cookies");
            }
          } catch (authError) {
            console.log("Auth check failed:", authError.message);
            setIsLoggedIn(false);
            setUser(null);
            setAuthProvider(null);
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoggedIn(false);
        setUser(null);
        setAuthProvider(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }

      console.log("=== AUTH INIT COMPLETE ===");
    };

    checkAuthStatus();
  }, [setIsLoggedIn, setUser, setIsAuthInitialized, setAuthProvider]);
};
