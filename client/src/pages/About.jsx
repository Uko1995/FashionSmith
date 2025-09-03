import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function About() {
  const navigate = useNavigate();
  return (
    <motion.main
      className="pt-16 min-h-screen bg-gradient-to-br from-base-100 -mt-15 via-base-200 to-base-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Section */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-4">
              <motion.h1
                className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                About FashionSmith
              </motion.h1>
            </div>

            <motion.div
              className="space-y-6 text-lg leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-base-content/80">
                Welcome to{" "}
                <span className="font-semibold text-primary">FashionSmith</span>
                , where craftsmanship meets contemporary style. We're passionate
                about creating bespoke tailoring solutions that reflect your
                unique personality and elevate your wardrobe.
              </p>

              <p className="text-base-content/80">
                Founded with the vision of revolutionizing traditional
                tailoring, we combine time-honored techniques with modern
                innovation. Our expert tailors and stylists work meticulously to
                ensure every piece is crafted to perfection, using premium
                fabrics and attention to detail.
              </p>

              <motion.div
                className="bg-base-200 p-6 rounded-2xl border-l-4 border-primary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Our Mission
                </h3>
                <p className="text-base-content/70">
                  To empower individuals with perfectly fitted garments that
                  boost confidence and express personal style, while maintaining
                  the highest standards of quality and sustainability.
                </p>
              </motion.div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {[
                {
                  value: "50+",
                  label: "Happy Customers",
                  color: "text-primary",
                },
                {
                  value: "1000+",
                  label: "Custom Pieces",
                  color: "text-secondary",
                },
                { value: "10+", label: "Fabric Options", color: "text-accent" },
                { value: "24/7", label: "Support", color: "text-info" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className={`text-3xl font-bold ${stat.color}`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-base-content/60">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              className="pt-6 flex justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <motion.button
                onClick={() => navigate("/gallery")}
                className="btn btn-primary w-4/5 btn-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Custom Journey
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.img
              src="/garments.webp"
              alt="FashionSmith Bespoke Suit"
              className="w-full h-full object-cover"
              loading="lazy"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <motion.div
        className="py-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Why Choose FashionSmith?
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              We're committed to excellence in every aspect of our service, from
              consultation to final fitting and even after sales service.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Quality Assurance",
                description:
                  "Every garment undergoes rigorous quality checks to ensure perfection.",
                color: "primary",
              },
              {
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Fast Turnaround",
                description:
                  "Quick delivery without compromising on quality and craftsmanship.",
                color: "secondary",
              },
              {
                icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
                title: "Personal Touch",
                description:
                  "Dedicated consultation and personalized service for every customer.",
                color: "accent",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
              >
                <div className="card-body text-center">
                  <motion.div
                    className={`w-16 h-16 bg-${value.color}/10 rounded-full flex items-center justify-center mx-auto mb-4`}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      className={`w-8 h-8 text-${value.color}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={value.icon}
                      ></path>
                    </svg>
                  </motion.div>
                  <h3 className="card-title justify-center">{value.title}</h3>
                  <p className="text-base-content/70">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
}
