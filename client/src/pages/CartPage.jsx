import React from "react";
import { useCart } from "../hooks/useCart";
import { MinusIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { formatCurrency, parsePrice } from "../utils/currency";

const CartPage = () => {
  const {
    cartItems,
    updateCartItemQuantity,
    removeFromCart,
    getCartTotal,
    clearCart,
    proceedToCheckout,
    isLoggedIn,
  } = useCart();
  console.log(cartItems);

  if (cartItems.length === 0) {
    return (
      <div className="container h-screen mt-16 mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Your Cart</h2>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-24 h-24 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l-1.5-5m0 0L3 3m16 10v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m14 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <a
            href="/gallery"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container h-screen mt-16 mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Your Cart</h2>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-700 flex items-center gap-2"
        >
          <TrashIcon size={16} />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-600">
                    ₦{formatCurrency(parsePrice(item.price))} each
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateCartItemQuantity(item.id, item.quantity - 1)
                    }
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <MinusIcon size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateCartItemQuantity(item.id, item.quantity + 1)
                    }
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <PlusIcon size={16} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-lg">
                    ₦{formatCurrency(parsePrice(item.price) * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Cart Summary</h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₦{formatCurrency(getCartTotal())}</span>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₦{formatCurrency(getCartTotal())}</span>
                </div>
              </div>
            </div>

            <button
              onClick={proceedToCheckout}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              {!isLoggedIn ? "Login to Checkout" : "Proceed to Checkout"}
            </button>

            {!isLoggedIn && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                You'll be redirected to login
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
