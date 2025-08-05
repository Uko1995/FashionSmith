import { create } from "zustand";

export const useUiStore = create((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  user: {},
  setUser: (user) => set({ user }),
  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),
}));
