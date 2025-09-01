import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import apiClient from "../utils/axiosConfig";
import { useUiStore } from "../store/uiStore";
import { decodeJWT } from "../utils/jwtDecoder";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { setIsLoggedIn, setUser, setAuthProvider } = useUiStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const token = searchParams.get("token");
      const success = searchParams.get("success");
      const error = searchParams.get("error");

      if (error) {
        toast.error("Authentication failed. Please try again.");
        navigate("/login");
        return;
      }

      if (success === "true" && token) {
        try {
          // Store the token in localStorage
          localStorage.setItem("authToken", token);

          // Update axios default headers
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;

          // Decode user data from JWT token instead of making API call
          const decodedToken = decodeJWT(token);
          if (!decodedToken) {
            throw new Error("Invalid token format");
          }

          // Create user object from decoded token
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

          // Update UI store state
          setIsLoggedIn(true);
          setUser(userData);
          setAuthProvider("google"); // Set auth provider to google

          // Store user data in localStorage
          localStorage.setItem("user", JSON.stringify(userData));

          // Invalidate and refetch user data (for any cached queries)
          queryClient.invalidateQueries(["user"]);
          queryClient.invalidateQueries(["dashboardOverview"]);

          toast.success("Successfully logged in with Google!");

          // Redirect to profile (dashboard routes redirect to profile)
          navigate("/profile");
        } catch (error) {
          console.error("Auth callback error:", error);
          toast.error("Failed to complete authentication");
          navigate("/login");
        }
      } else {
        toast.error("Authentication failed. Please try again.");
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [
    searchParams,
    navigate,
    queryClient,
    setIsLoggedIn,
    setUser,
    setAuthProvider,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="mb-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
          <h2 className="card-title justify-center mb-2">
            Completing Authentication
          </h2>
          <p className="text-base-content/60">
            Please wait while we set up your account...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
