import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import router from "./router/index.jsx";
import Spinner from "./components/Spinner.jsx";
import FashionSmithLogo from "./components/FashionSmithLogo.jsx";
import {
  usePerformanceMonitoring,
  useUserTracking,
} from "./hooks/usePerformanceMonitoring.js";
import { useTokenRefresh } from "./hooks/useTokenRefresh.js";
import { useAuthInit } from "./hooks/useAuthInit.js";
import useLogout from "./hooks/useLogout.js";
import SVGFallback from "./components/SVGFallBack";

export default function App() {
  const { forceLogout } = useLogout();

  // Initialize performance monitoring and user tracking
  usePerformanceMonitoring();
  useUserTracking();

  // Initialize automatic token refresh
  useTokenRefresh();

  // Initialize authentication state from cookies
  useAuthInit();

  // Listen for forced logout events
  useEffect(() => {
    const handleForceLogout = () => {
      forceLogout();
    };

    window.addEventListener("auth:forceLogout", handleForceLogout);

    return () => {
      window.removeEventListener("auth:forceLogout", handleForceLogout);
    };
  }, [forceLogout]);

  return (
    <>
      <RouterProvider
        router={router}
        fallbackElement={<SVGFallback />}
        hydrateFallback={<SVGFallback />}
      />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: "",
          duration: 4000,

          // Default options for specific types
          success: {
            duration: 3000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
    </>
  );
}
