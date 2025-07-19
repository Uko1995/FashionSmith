import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import About from "../pages/About";
import Contact from "../pages/Contact";
import FAQ from "../pages/FAQ";
import Services from "../pages/Services";
import ErrorElement from "../components/ErrorElement";
import Home from "../components/Home"; // Importing the Home component
import { Component } from "react";

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
    errorElement: <ErrorElement />,
    children: [
      { index: true, Component: Home, errorElement: <ErrorElement /> },
      {
        path: "/about",
        lazy: async () => ({
          Component: (await import("../pages/About")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "/contacts",
        lazy: async () => ({
          Component: (await import("../pages/Contact")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "/faq",
        lazy: async () => ({
          Component: (await import("../pages/FAQ")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "/services",
        lazy: async () => ({
          Component: (await import("../pages/Services")).default,
        }),
        errorElement: <ErrorElement />,
      },
      {
        path: "login",
        lazy: async () => ({
          Component: (await import("../pages/Login")).default,
        }),
      },
      {
        path: "register",
        lazy: async () => ({
          Component: (await import("../pages/Register")).default,
        }),
      },
    ],
  },
]);

export default router;
