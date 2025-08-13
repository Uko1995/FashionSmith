import { Navigate, useLocation } from "react-router-dom";
import { useUiStore } from "../store/uiStore";
import SVGFallback from "./SVGFallBack";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, isAuthInitialized } = useUiStore();
  const location = useLocation();

  // Show loading while checking authentication
  if (!isAuthInitialized) {
    console.log("[PROTECTED ROUTE] Waiting for auth initialization...");
    return <SVGFallback />;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    console.log(
      "[PROTECTED ROUTE] User not authenticated, redirecting to login"
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected component
  console.log(
    "[PROTECTED ROUTE] User authenticated, rendering protected content"
  );
  return children;
}
