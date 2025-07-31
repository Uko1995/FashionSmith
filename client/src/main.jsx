import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes

      refetchOnWindowFocus: false, // Disable refetching on window focus
    },
    mutations: {
      // Retry failed mutations twice
    },
  },
});

// Register Service Worker for PWA functionality
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered successfully:",
          registration.scope
        );

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New content available, show update notification
                if (confirm("New version available! Reload to update?")) {
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "CACHE_PERFORMANCE") {
        // Handle cache performance data
        console.log("Cache performance:", event.data);
      }
    });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIaOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
