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
    ],
  },
  {
    path: "dashboard",
    lazy: async () => {
      const Dashboard = (await import("../pages/Dashboard")).default;
      return {
        Component: () => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      };
    },
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("../components/DashboardOverview")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "profile",
        lazy: async () => ({
          Component: (await import("../pages/Profile")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "orders",
        lazy: async () => ({
          Component: (await import("../pages/Orders")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "notifications",
        lazy: async () => ({
          Component: (await import("../pages/Notifications")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "settings",
        lazy: async () => ({
          Component: (await import("../pages/Settings")).default,
        }),
        errorElement: <ErrorElement />,
      },

      {
        path: "payments",
        lazy: async () => ({
          Component: (await import("../pages/Payment")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "measurements",
        lazy: async () => ({
          Component: (await import("../pages/Measurements")).default,
        }),
        errorElement: <ErrorElement />,
      },
    ],
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
