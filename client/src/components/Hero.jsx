import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  PlayIcon,
  StarIcon,
  CheckCircleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

import { useUiStore } from "../store/uiStore";

export default function Hero() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const { isLoggedIn } = useUiStore();

  // Handle navigation with smooth transitions
  const handleGetStarted = useCallback(() => {
    navigate("/register");
  }, [navigate]);

  const handleViewGallery = useCallback(() => {
    navigate("/gallery");
  }, [navigate]);

  // Handle image loading
  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = "/FashionSmith.webp";
  }, []);

  return (
    <section className="relative  w-full -mt-16 h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className={`absolute inset-0 bg-cover md:bg-contain bg-black bg-center bg-no-repeat transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: "url('/FashionSmith.webp')" }}
        aria-hidden="true"
      />

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />

      {/* Main Content */}
      <div className="relative z-10 flex mt-20 flex-col justify-center h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-5 items-center">
            {/* Left Content */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Main Heading */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
                  <motion.span
                    className="block"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    CRAFT YOUR
                  </motion.span>
                  <motion.span
                    className="block text-accent drop-shadow-2xl"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    PERFECT STYLE
                  </motion.span>
                </h1>
              </div>

              {/* Description */}
              <motion.p
                className="text-white/90 text-lg lg:text-xl max-w-2xl leading-relaxed font-medium"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Experience bespoke tailoring where traditional Nigerian
                craftsmanship meets contemporary design.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {!isLoggedIn && (
                  <motion.button
                    onClick={handleGetStarted}
                    className="group btn btn-primary btn-lg text-white font-bold shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                    aria-label="Start your bespoke journey"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Start Your Journey</span>
                    <ArrowRightIcon
                      size={20}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </motion.button>
                )}

                <motion.button
                  onClick={handleViewGallery}
                  className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-gray-900 font-bold transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Our Gallery
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
