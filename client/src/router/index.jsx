import { createBrowserRouter } from "react-router-dom";
import ErrorElement from "../components/ErrorElement";
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
      {
        path: "dashboard",
        lazy: async () => ({
          Component: (await import("../pages/Dashboard")).default,
        }),
        errorElement: <ErrorElement />,
      },
    ],
  },
]);

export default router;
