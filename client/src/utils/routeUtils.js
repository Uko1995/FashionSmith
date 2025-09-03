// Define protected routes that require authentication
export const PROTECTED_ROUTES = ["/dashboard", "/admin"];

// Define public routes where users can stay after logout
export const PUBLIC_ROUTES = [
  "/",
  "/home",
  "/about",
  "/gallery",
  "/contacts",
  "/faq",
  "/login",
  "/register",
  "/verify-email",
];

// Check if a given path is a protected route
export const isProtectedRoute = (path) => {
  const isProtected = PROTECTED_ROUTES.some((route) => {
    return path.startsWith(route);
  });

  return isProtected;
};

// Check if a given path is a public route
export const isPublicRoute = (path) => {
  return PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(route + "/")
  );
};

// Check if user should be redirected to login after logout
export const shouldRedirectToLogin = (
  currentPath = window.location.pathname
) => {
  const shouldRedirect = isProtectedRoute(currentPath);
  return shouldRedirect;
};
