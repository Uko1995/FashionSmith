import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function DashboardRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Map old dashboard routes to new profile routes
    const path = location.pathname;

    if (path === "/dashboard" || path === "/dashboard/") {
      navigate("/profile", { replace: true });
    } else if (path === "/dashboard/profile") {
      navigate("/profile", { replace: true });
    } else if (path === "/dashboard/orders") {
      navigate("/profile?tab=orders", { replace: true });
    } else if (path === "/dashboard/notifications") {
      navigate("/profile?tab=notifications", { replace: true });
    } else if (path === "/dashboard/payments") {
      navigate("/profile?tab=payments", { replace: true });
    } else if (path === "/dashboard/settings") {
      navigate("/settings", { replace: true });
    } else if (path.startsWith("/dashboard/")) {
      // For any other dashboard subroutes, default to profile
      navigate("/profile", { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p className="text-base-content/60">Redirecting...</p>
      </div>
    </div>
  );
}
