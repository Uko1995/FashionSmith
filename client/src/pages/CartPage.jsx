import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  ShoppingCartIcon,
} from "@phosphor-icons/react";
import { formatCurrency, parsePrice } from "../utils/currency";

const CartPage = () => {
  const navigate = useNavigate();
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
      <motion.div
        className="container h-screen mt-16 mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Your Cart
        </motion.h2>
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="text-gray-400 mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShoppingCartIcon className="w-24 h-24 mx-auto" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <motion.a
            onClick={() => navigate("/gallery")}
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue Shopping
          </motion.a>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container h-screen mt-16 mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold">Your Cart</h2>
        <motion.button
          onClick={clearCart}
          className="text-red-500 hover:text-red-700 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <TrashIcon size={16} />
          Clear Cart
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <motion.div
          className="lg:col-span-2 space-y-4"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence>
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
              >
                <div className="flex items-center gap-4">
                  <motion.img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                    whileHover={{ scale: 1.1 }}
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600">
                      ₦{formatCurrency(parsePrice(item.price))} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MinusIcon size={16} />
                    </motion.button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <motion.button
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PlusIcon size={16} />
                    </motion.button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      ₦{formatCurrency(parsePrice(item.price) * item.quantity)}
                    </p>
                    <motion.button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Remove
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Cart Summary */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-md p-6 sticky top-4"
            whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            <h3 className="text-xl font-semibold mb-4">Cart Summary</h3>

            <motion.div
              className="space-y-2 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
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
            </motion.div>

            <motion.button
              onClick={proceedToCheckout}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              {!isLoggedIn ? "Login to Checkout" : "Proceed to Checkout"}
            </motion.button>

            {!isLoggedIn && (
              <motion.p
                className="text-sm text-gray-500 mt-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                You'll be redirected to login
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CartPage;
