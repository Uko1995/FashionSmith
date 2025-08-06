import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useUiStore = create(
  devtools(
    (set) => ({
      isLoggedIn: false,
      setIsLoggedIn: (value) => {
        console.log("[ZUSTAND] Setting isLoggedIn:", value);
        set({ isLoggedIn: value }, false, "setIsLoggedIn");
      },
      user: null,
      setUser: (user) => {
        console.log("[ZUSTAND] Setting user:", user);
        set({ user }, false, "setUser");
      },
      isLoading: false,
      setIsLoading: (value) => {
        console.log("[ZUSTAND] Setting isLoading:", value);
        set({ isLoading: value }, false, "setIsLoading");
      },
      // Helper function to clear user state on logout
      clearAuth: () => {
        console.log("[ZUSTAND] Clearing auth state");
        set({ isLoggedIn: false, user: null }, false, "clearAuth");
      },
    }),
    {
      name: "ui-store", // Name for devtools
    }
  )
);
