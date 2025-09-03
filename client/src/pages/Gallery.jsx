import { motion } from "framer-motion";
import ProductAndService from "../components/ProductAndService";

export default function Gallery() {
  return (
    <motion.main
      className="pt-16 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <ProductAndService />
      </motion.div>
    </motion.main>
  );
}
