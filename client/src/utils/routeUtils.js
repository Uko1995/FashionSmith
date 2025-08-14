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
  console.log(`[ROUTE UTILS] Checking if path "${path}" is protected`);
  console.log(`[ROUTE UTILS] Protected routes:`, PROTECTED_ROUTES);

  const isProtected = PROTECTED_ROUTES.some((route) => {
    const matches = path.startsWith(route);
    console.log(
      `[ROUTE UTILS] Does "${path}" start with "${route}"? ${matches}`
    );
    return matches;
  });

  console.log(
    `[ROUTE UTILS] Final result - is "${path}" protected? ${isProtected}`
  );
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
  console.log(
    `[ROUTE UTILS] Checking if should redirect to login for path: ${currentPath}`
  );
  const shouldRedirect = isProtectedRoute(currentPath);
  console.log(`[ROUTE UTILS] Should redirect to login: ${shouldRedirect}`);
  return shouldRedirect;
};
