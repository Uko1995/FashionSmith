import { createBrowserRouter } from "react-router-dom";
import ErrorElement from "../components/ErrorElement";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../components/Home"; // Importing the Home component

const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => ({
      Component: (await import("../pages/HomePage")).default,
    }),
    errorElement: <ErrorElement />,
    children: [
      { index: true, Component: Home, errorElement: <ErrorElement /> },
      {
        path: "about",
        lazy: async () => ({
          Component: (await import("../pages/About")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "contacts",
        lazy: async () => ({
          Component: (await import("../pages/Contact")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "faq",
        lazy: async () => ({
          Component: (await import("../pages/FAQ")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "gallery",
        lazy: async () => ({
          Component: (await import("../pages/Gallery")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "login",
        lazy: async () => ({
          Component: (await import("../pages/Login")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "auth/callback",
        lazy: async () => ({
          Component: (await import("../pages/AuthCallback")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "register",
        lazy: async () => ({
          Component: (await import("../pages/Register")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "verify-email",
        lazy: async () => ({
          Component: (await import("../pages/VerifyEmail")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "verify-email/:uniqueString",
        lazy: async () => ({
          Component: (await import("../pages/VerifyEmail")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "cart",
        lazy: async () => ({
          Component: (await import("../pages/CartPage")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "email-verification",
        lazy: async () => ({
          Component: (await import("../components/EmailVerification")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "payment-success",
        lazy: async () => ({
          Component: (await import("../pages/PaymentSuccess")).default,
        }),
        errorElement: <ErrorElement />,
      },

      // Add direct profile and settings routes
      {
        path: "profile",
        lazy: async () => {
          const ProfilePage = (await import("../pages/ProfilePage")).default;
          return {
            Component: () => (
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            ),
          };
        },
        errorElement: <ErrorElement />,
      },
      {
        path: "settings",
        lazy: async () => {
          const Settings = (await import("../pages/Settings")).default;
          return {
            Component: () => (
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            ),
          };
        },
        errorElement: <ErrorElement />,
      },
    ],
  },
  // Keep legacy dashboard routes for backward compatibility but redirect to profile
  {
    path: "dashboard/*",
    lazy: async () => {
      const DashboardRedirect = (
        await import("../components/DashboardRedirect")
      ).default;
      return {
        Component: () => (
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        ),
      };
    },
    errorElement: <ErrorElement />,
  },
  {
    path: "admin",
    lazy: async () => {
      const Admin = (await import("../pages/Admin")).default;
      return {
        Component: () => (
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        ),
      };
    },
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("../components/AdminDashboard")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "users",
        lazy: async () => ({
          Component: (await import("../components/AdminUsers")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "orders",
        lazy: async () => ({
          Component: (await import("../components/AdminOrders")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "products",
        lazy: async () => ({
          Component: (await import("../components/AdminProducts")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "settings",
        lazy: async () => ({
          Component: (await import("../components/AdminSettings")).default,
        }),
        errorElement: <ErrorElement />,
      },
    ],
  },
]);

export default router;
