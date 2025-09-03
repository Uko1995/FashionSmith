import { motion } from "framer-motion";
import AppGuide from "./AppGuide";
import Contacts from "./Contacts";
import Hero from "./Hero";
import HomePageProducts from "./HomePageProducts";
import Testimonials from "./Testimonials";

export default function Home() {
  return (
    <motion.div
      className="space-y-8 md:space-y-16 lg:space-y-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Hero />
      <AppGuide />
      <HomePageProducts />
      <Testimonials />
      <Contacts />
    </motion.div>
  );
}
