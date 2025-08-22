import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useUiStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Authentication state
        isLoggedIn: false,
        user: null,
        isAuthInitialized: false,

        // UI state
        isLoading: false,

        // cart - persisted in localStorage for anonymous users
        cartItems: [],

        // Enhanced cart actions
        addToCart: (item) => {
          console.log("[ZUSTAND] Adding to cart:", item);
          set((state) => {
            const existingItem = state.cartItems.find(
              (cartItem) => cartItem.id === item.id
            );

            if (existingItem) {
              return {
                cartItems: state.cartItems.map((cartItem) =>
                  cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
                ),
              };
            } else {
              return {
                cartItems: [...state.cartItems, { ...item, quantity: 1 }],
              };
            }
          });
        },

        removeFromCart: (itemId) => {
          console.log("[ZUSTAND] Removing from cart:", itemId);
          set((state) => ({
            cartItems: state.cartItems.filter((item) => item.id !== itemId),
          }));
        },

        updateCartItemQuantity: (itemId, quantity) => {
          console.log(
            "[ZUSTAND] Updating cart item quantity:",
            itemId,
            quantity
          );
          set((state) => ({
            cartItems: state.cartItems
              .map((item) =>
                item.id === itemId
                  ? { ...item, quantity: Math.max(0, quantity) }
                  : item
              )
              .filter((item) => item.quantity > 0),
          }));
        },

        clearCart: () => {
          console.log("[ZUSTAND] Clearing cart");
          set({ cartItems: [] });
        },

        // Cart computed values
        getCartItemsCount: () => {
          const state = get();
          return state.cartItems.reduce(
            (total, item) => total + item.quantity,
            0
          );
        },

        getCartTotal: () => {
          const state = get();
          return state.cartItems.reduce((total, item) => {
            const price =
              typeof item.price === "string"
                ? parseFloat(item.price.replace(/[^\d.]/g, ""))
                : Number(item.price);
            return total + price * item.quantity;
          }, 0);
        },

        // Merge anonymous cart with user cart on login
        mergeAnonymousCart: async (userCartItems = []) => {
          console.log("[ZUSTAND] Merging anonymous cart with user cart");
          const state = get();
          const anonymousCart = state.cartItems;

          // Merge logic: combine items, sum quantities for duplicates
          const mergedCart = [...userCartItems];

          anonymousCart.forEach((anonymousItem) => {
            const existingUserItem = mergedCart.find(
              (item) => item.id === anonymousItem.id
            );
            if (existingUserItem) {
              existingUserItem.quantity += anonymousItem.quantity;
            } else {
              mergedCart.push(anonymousItem);
            }
          });

          set({ cartItems: mergedCart });
          return mergedCart;
        },

        // Save cart to server when user logs in
        syncCartWithServer: async (userId) => {
          console.log("[ZUSTAND] Syncing cart with server for user:", userId);
          const state = get();

          try {
            // You'll implement this API call
            const response = await fetch(`/api/cart/${userId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ cartItems: state.cartItems }),
            });

            if (!response.ok) {
              throw new Error("Failed to sync cart");
            }

            console.log("[ZUSTAND] Cart synced successfully");
          } catch (error) {
            console.error("[ZUSTAND] Failed to sync cart:", error);
          }
        },

        // Load user cart from server
        loadUserCart: async (userId) => {
          console.log("[ZUSTAND] Loading user cart from server");

          try {
            const response = await fetch(`/api/cart/${userId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });

            if (response.ok) {
              const userCart = await response.json();
              const mergedCart = await get().mergeAnonymousCart(
                userCart.items || []
              );

              // Sync the merged cart back to server
              await get().syncCartWithServer(userId);

              return mergedCart;
            }
          } catch (error) {
            console.error("[ZUSTAND] Failed to load user cart:", error);
          }
        },

        // Authentication actions
        setIsLoggedIn: (value) => {
          console.log("[ZUSTAND] Setting isLoggedIn:", value);
          set({ isLoggedIn: value }, false, "setIsLoggedIn");
        },

        setUser: (user) => {
          console.log("[ZUSTAND] Setting user:", user);
          set({ user }, false, "setUser");

          // Load and merge cart when user is set
          if (user && user.id) {
            get().loadUserCart(user.id);
          }
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
              // Keep cart items for anonymous shopping
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
              // Keep cart items for anonymous shopping
            },
            false,
            "resetAuthState"
          );
        },
      }),
      {
        name: "fashion-smith-store", // localStorage key
        partialize: (state) => ({
          cartItems: state.cartItems, // Only persist cart items
        }),
      }
    ),
    {
      name: "ui-store", // Name for devtools
    }
  )
);
