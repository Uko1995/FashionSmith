import { motion } from "framer-motion";
import Carousel from "./Carousel";

export default function AppGuide() {
  return (
    <motion.section
      className="py-8 md:py-12 px-4 bg-gradient-to-br from-base-100 to-base-200"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <motion.div
          className="text-center mb-6 md:mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-base-content mb-2 md:mb-3">
            How It Works
          </h2>
          <p className="text-sm md:text-base text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            Simple steps to get your perfect bespoke garments crafted by expert
            tailors.
          </p>
        </motion.div>

        {/* Carousel Section */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Carousel />
        </motion.div>

        {/* Compact Call to Action */}
        <motion.div
          className="text-center bg-gradient-to-r from-primary to-secondary p-4 md:p-6 rounded-xl text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">
            Ready to Start Your Journey?
          </h3>
          <p className="text-xs md:text-sm mb-3 md:mb-4 opacity-90 max-w-md mx-auto">
            Join satisfied customers who trust FashionSmith for bespoke fashion.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-3 justify-center max-w-md mx-auto">
            <motion.button
              className="btn btn-outline btn-lg sm:btn-md text-white border-white hover:bg-white hover:text-primary flex-1 min-h-[56px] sm:min-h-auto text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Collections
            </motion.button>
            <motion.button
              className="btn btn-lg sm:btn-md bg-white text-primary hover:bg-base-200 flex-1 min-h-[56px] sm:min-h-auto text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Consultation
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
