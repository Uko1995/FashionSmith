import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  HouseIcon,
  WarningCircleIcon,
  ShoppingBagIcon,
  UserIcon,
  QuestionIcon,
} from "@phosphor-icons/react";

export default function ErrorElement() {
  const navigate = useNavigate();

  const quickLinks = [
    {
      icon: <HouseIcon size={20} />,
      label: "Home",
      description: "Return to homepage",
      action: () => navigate("/"),
      color: "btn-primary",
    },
    {
      icon: <ShoppingBagIcon size={20} />,
      label: "Gallery",
      description: "Browse our collections",
      action: () => navigate("/gallery"),
      color: "btn-secondary",
    },
    {
      icon: <UserIcon size={20} />,
      label: "Account",
      description: "Manage your profile",
      action: () => navigate("/profile"),
      color: "btn-accent",
    },
    {
      icon: <QuestionIcon size={20} />,
      label: "Help",
      description: "Get support",
      action: () => navigate("/faq"),
      color: "btn-info",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="min-h-screen lg:h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Desktop Row Layout / Mobile Column Layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Left Column - Error Illustration & Message */}
          <div className="text-center lg:text-left mb-12 lg:mb-0">
            {/* Error Illustration */}
            <motion.div className="mb-4" variants={itemVariants}>
              <motion.div
                className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-error/10 rounded-full mb-3"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <WarningCircleIcon
                  size={80}
                  className="text-error md:w-24 md:h-24 lg:w-32 lg:h-32"
                  weight="duotone"
                />
              </motion.div>
            </motion.div>

            {/* Error Message */}
            <motion.div className="mb-8 space-y-4" variants={itemVariants}>
              <motion.h1
                className="text-4xl md:text-6xl lg:text-8xl font-bold text-base-content"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-error">404</span>
              </motion.h1>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-base-content mb-2">
                Page Not Found
              </h2>

              <p className="text-lg lg:text-xl text-base-content/70 max-w-md lg:max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Sorry, we couldn't find the page you're looking for. It might
                have been moved, deleted, or you entered the wrong URL.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="mb-8 lg:mb-0 space-y-4"
              variants={itemVariants}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <motion.button
                  onClick={() => navigate(-1)}
                  className="btn btn-primary btn-lg gap-2 min-w-[140px]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeftIcon size={20} />
                  Go Back
                </motion.button>

                <motion.button
                  onClick={() => navigate("/")}
                  className="btn btn-outline btn-lg gap-2 min-w-[140px]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HouseIcon size={20} />
                  Home
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Interactive Elements */}
          <div>
            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold text-base-content mb-6 text-center lg:text-left">
                Or try these popular pages:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickLinks.map((link, index) => (
                  <motion.button
                    key={link.label}
                    onClick={link.action}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div className="card-body items-center text-center p-6">
                      <div className={`btn ${link.color} btn-circle mb-3`}>
                        {link.icon}
                      </div>
                      <h4 className="font-semibold text-base-content">
                        {link.label}
                      </h4>
                      <p className="text-sm text-base-content/60">
                        {link.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer Note - Full Width */}
        <motion.div
          className="mt-12 text-sm text-base-content/50 text-center"
          variants={itemVariants}
        >
          <p>Error Code: 404 | FashionSmith © 2025</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
