import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useUiStore = create(
  devtools(
    (set) => ({
      // Authentication state
      isLoggedIn: false,
      user: null,
      isAuthInitialized: false,

      // UI state
      isLoading: false,

      // Authentication actions
      setIsLoggedIn: (value) => {
        console.log("[ZUSTAND] Setting isLoggedIn:", value);
        set({ isLoggedIn: value }, false, "setIsLoggedIn");
      },

      setUser: (user) => {
        console.log("[ZUSTAND] Setting user:", user);
        set({ user }, false, "setUser");
      },

      setIsAuthInitialized: (value) => {
        console.log("[ZUSTAND] Setting isAuthInitialized:", value);
        set({ isAuthInitialized: value }, false, "setIsAuthInitialized");
      },

      // UI actions
      setIsLoading: (value) => {
        console.log("[ZUSTAND] Setting isLoading:", value);
        set({ isLoading: value }, false, "setIsLoading");
      },

      // Helper function to clear user state on logout
      clearAuth: () => {
        console.log("[ZUSTAND] Clearing auth state");
        set(
          {
            isLoggedIn: false,
            user: null,
            isAuthInitialized: true,
          },
          false,
          "clearAuth"
        );
      },

      // Reset all state (for logout)
      resetAuthState: () => {
        console.log("[ZUSTAND] Resetting auth state");
        set(
          {
            isLoggedIn: false,
            user: null,
            isAuthInitialized: true,
          },
          false,
          "resetAuthState"
        );
      },
    }),
    {
      name: "ui-store", // Name for devtools
    }
  )
);
