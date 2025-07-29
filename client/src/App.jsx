import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import router from "./router/index.jsx";
import Spinner from "./components/Spinner.jsx";
import {
  usePerformanceMonitoring,
  useUserTracking,
} from "./hooks/usePerformanceMonitoring.js";

export default function App() {
  // Initialize performance monitoring and user tracking
  usePerformanceMonitoring();
  useUserTracking();

  return (
    <>
      <RouterProvider router={router} fallbackElement={<Spinner />} />
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
