import { useEffect } from "react";

import { useUiStore } from "../store/uiStore";
import apiClient from "../utils/axiosConfig";
import { decodeJWT } from "../utils/jwtDecoder";

export const useAuthInit = () => {
  const { setIsLoggedIn, setUser, setIsAuthInitialized, setAuthProvider } =
    useUiStore();

  useEffect(() => {
    console.log("[AUTH INIT] Checking authentication status from cookies...");

    const checkAuthStatus = async () => {
      try {
        // Check if we have a JWT token (Google OAuth)
        const authToken = localStorage.getItem("authToken");

        if (authToken) {
          // For Google OAuth users, set Authorization header and auth provider
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${authToken}`;
          setAuthProvider("google");
          console.log(
            "[AUTH INIT] Google OAuth token found, setting auth provider"
          );

          // Try to get user data from localStorage first
          let userData = null;
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              userData = JSON.parse(savedUser);
              console.log(
                "[AUTH INIT] Google OAuth user data restored from localStorage"
              );
            } catch (error) {
              console.error(
                "[AUTH INIT] Error parsing saved user data:",
                error
              );
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
                console.log(
                  "[AUTH INIT] Google OAuth user data decoded from JWT"
                );
              }
            } catch (decodeError) {
              console.error(
                "[AUTH INIT] Error decoding JWT token:",
                decodeError
              );
            }
          }

          if (userData) {
            setUser(userData);
            setIsLoggedIn(true);
          }
        } else {
          // For regular users, check cookies and clear any Google OAuth headers
          delete apiClient.defaults.headers.common["Authorization"];

          const response = await apiClient.get("/api/users/auth-check");

          if (
            response.status === 200 &&
            response.data.message === "Authenticated"
          ) {
            console.log("[AUTH INIT] Regular user is authenticated");
            setIsLoggedIn(true);
            setAuthProvider("local");

            // Get user data from localStorage if available
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
            setAuthProvider(null);
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("[AUTH INIT] Auth check failed:", error);
        setIsLoggedIn(false);
        setUser(null);
        setAuthProvider(null);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      } finally {
        // Always set initialization as complete
        setIsAuthInitialized(true);
      }
    };

    checkAuthStatus();
  }, [setIsLoggedIn, setUser, setIsAuthInitialized, setAuthProvider]);
};
