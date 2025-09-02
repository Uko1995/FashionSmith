import { ShoppingCartIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useUiStore } from "../store/uiStore";
import { useState, useEffect } from "react";

export default function FloatingCart() {
  const cartItems = useUiStore((state) => state.cartItems);
  const getCartItemsCount = useUiStore((state) => state.getCartItemsCount);
  const itemCount = getCartItemsCount();
  const [isVisible, setIsVisible] = useState(true); // Always visible for testing
  const [showNotification, setShowNotification] = useState(false);
  const [lastItemCount, setLastItemCount] = useState(0);

  // Debug logging
  console.log("[FLOATING_CART] Debug:", { itemCount, cartItems, isVisible });

  // Show cart when items are added
  useEffect(() => {
    if (itemCount > 0) {
      setIsVisible(true);

      // Show notification when new item is added
      if (itemCount > lastItemCount) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }

      setLastItemCount(itemCount);
    }
  }, [itemCount, lastItemCount]);

  // Don't render if no items (temporarily disabled for testing)
  if (!isVisible || itemCount === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/cart"
          className="relative bg-gradient-to-r from-primary to-secondary text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group block"
        >
          <ShoppingCartIcon size={24} weight="bold" />

          {/* Cart Count Badge */}
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Link>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-20 right-6 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm transform transition-all duration-500 ease-out">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCartIcon
                  size={20}
                  className="text-green-600"
                  weight="bold"
                />
              </div>
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Added to Cart!
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                {itemCount === 1
                  ? "1 item in your cart"
                  : `${itemCount} items in your cart`}
              </p>
              <Link
                to="/cart"
                className="inline-flex items-center text-xs font-medium text-primary hover:text-primary-focus transition-colors"
              >
                View Cart
              </Link>
            </div>

            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XIcon size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
