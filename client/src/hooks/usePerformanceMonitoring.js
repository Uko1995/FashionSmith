import { useEffect } from "react";

// Hook for tracking Core Web Vitals and performance metrics
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return;

    // Track Core Web Vitals
    const trackWebVitals = () => {
      // First Contentful Paint (FCP)
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === "first-contentful-paint") {
              console.log("FCP:", entry.startTime);
              // Send to analytics service
              sendMetric("FCP", entry.startTime);
            }
          }
        });
        observer.observe({ entryTypes: ["paint"] });
      }

      // Largest Contentful Paint (LCP)
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log("LCP:", lastEntry.startTime);
          sendMetric("LCP", lastEntry.startTime);
        });
        observer.observe({ entryTypes: ["largest-contentful-paint"] });
      }

      // Cumulative Layout Shift (CLS)
      if ("PerformanceObserver" in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          console.log("CLS:", clsValue);
          sendMetric("CLS", clsValue);
        });
        observer.observe({ entryTypes: ["layout-shift"] });
      }
    };

    // Track page load performance
    const trackPageLoad = () => {
      window.addEventListener("load", () => {
        // Use requestIdleCallback to avoid blocking main thread
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => {
            const navigation = performance.getEntriesByType("navigation")[0];

            const metrics = {
              TTFB: navigation.responseStart - navigation.requestStart,
              DOMContentLoaded:
                navigation.domContentLoadedEventEnd -
                navigation.domContentLoadedEventStart,
              LoadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              TotalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
            };

            console.log("Page Load Metrics:", metrics);

            // Send metrics to analytics
            Object.entries(metrics).forEach(([key, value]) => {
              sendMetric(key, value);
            });
          });
        }
      });
    };

    // Track JavaScript errors
    const trackErrors = () => {
      window.addEventListener("error", (event) => {
        console.error("JavaScript Error:", {
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
          error: event.error,
        });

        // Send error to monitoring service
        sendError({
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack,
        });
      });

      // Track unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        console.error("Unhandled Promise Rejection:", event.reason);
        sendError({
          message: "Unhandled Promise Rejection",
          reason: event.reason,
        });
      });
    };

    // Initialize tracking
    trackWebVitals();
    trackPageLoad();
    trackErrors();

    // Cleanup function
    return () => {
      // Clean up observers if needed
    };
  }, []);

  // Function to send metrics to analytics service
  const sendMetric = (name, value) => {
    // In production, send to your analytics service
    // For now, we'll just log and could send to Google Analytics, etc.

    if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
      window.gtag("event", "web_vitals", {
        event_category: "Performance",
        event_label: name,
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Example: Send to custom analytics endpoint
    if (import.meta.env.PROD) {
      fetch("/api/analytics/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metric: name,
          value: value,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      }).catch((err) => console.error("Analytics error:", err));
    }
  };

  // Function to send errors to monitoring service
  const sendError = (errorInfo) => {
    if (import.meta.env.PROD) {
      fetch("/api/analytics/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...errorInfo,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      }).catch((err) => console.error("Error reporting failed:", err));
    }
  };
};

// Hook for tracking user interactions
export const useUserTracking = () => {
  useEffect(() => {
    const trackClicks = (event) => {
      const element = event.target;
      const tagName = element.tagName.toLowerCase();

      // Track button clicks, link clicks, etc.
      if (tagName === "button" || tagName === "a") {
        const action =
          element.textContent ||
          element.getAttribute("aria-label") ||
          "Unknown";
        console.log("User Interaction:", {
          type: "click",
          element: tagName,
          action: action,
          url: window.location.href,
        });

        // Send to analytics
        if (
          typeof window !== "undefined" &&
          typeof window.gtag !== "undefined"
        ) {
          window.gtag("event", "click", {
            event_category: "User Interaction",
            event_label: action,
            value: 1,
          });
        }
      }
    };

    document.addEventListener("click", trackClicks);

    return () => {
      document.removeEventListener("click", trackClicks);
    };
  }, []);
};
