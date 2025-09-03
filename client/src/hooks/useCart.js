import { useUiStore } from "../store/uiStore";
import { useNavigate } from "react-router-dom";

export const useCart = () => {
  const {
    cartItems,
    addToCart: addToCartStore,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartItemsCount,
    getCartTotal,
    isLoggedIn,
  } = useUiStore();

  const navigate = useNavigate();

  const addToCart = (item) => {
    addToCartStore(item);
    // You can add toast notification here if you have a toast library
    console.log(`${item.name} added to cart!`);
  };

  const proceedToCheckout = () => {
    if (!isLoggedIn) {
      // Redirect to login with return URL
      navigate("/login?returnUrl=/checkout");
      return false;
    }

    if (cartItems.length === 0) {
      return false;
    }

    navigate("/checkout");
    return true;
  };

  const getCartSummary = () => {
    return {
      itemCount: getCartItemsCount(),
      total: getCartTotal(),
      isEmpty: cartItems.length === 0,
    };
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartItemsCount,
    getCartTotal,
    proceedToCheckout,
    getCartSummary,
    isLoggedIn,
  };
};
