import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretDownIcon,
  CaretUpIcon,
  MagnifyingGlassIcon,
  QuestionIcon,
  ShoppingBagIcon,
  TruckIcon,
  CreditCardIcon,
  UserIcon,
  PhoneIcon,
  RulerIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChatCircleIcon,
} from "@phosphor-icons/react";

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const categories = [
    { id: "all", label: "All Questions", icon: <QuestionIcon size={20} /> },
    {
      id: "orders",
      label: "Orders & Shopping",
      icon: <ShoppingBagIcon size={20} />,
    },
    {
      id: "measurements",
      label: "Measurements",
      icon: <RulerIcon size={20} />,
    },
    {
      id: "payment",
      label: "Payment & Pricing",
      icon: <CreditCardIcon size={20} />,
    },
    {
      id: "delivery",
      label: "Delivery & Shipping",
      icon: <TruckIcon size={20} />,
    },
    { id: "account", label: "Account & Support", icon: <UserIcon size={20} /> },
  ];

  const faqData = [
    // Orders & Shopping
    {
      id: "order-process",
      category: "orders",
      question: "How does the custom tailoring process work?",
      answer:
        "Our custom tailoring process is simple and personalized. First, you select your preferred fabric and style. Then, we take your measurements (either through our online form or in-person consultation). Our expert tailors create your garment using traditional techniques combined with modern precision. Finally, we deliver your perfectly fitted piece within 2-4 weeks.",
    },
    {
      id: "fabric-selection",
      category: "orders",
      question: "What fabrics do you offer?",
      answer:
        "We offer an extensive collection of premium fabrics including wool, cotton, linen, silk, and blends. Our fabrics come in various weights, patterns, and colors to suit different occasions. Each fabric is carefully selected for quality, durability, and comfort. You can browse our fabric gallery and consult with our stylists for recommendations.",
    },
    {
      id: "customization-options",
      category: "orders",
      question: "Can I customize my garment design?",
      answer:
        "Absolutely! We offer extensive customization options including lapel styles, pocket configurations, button choices, lining colors, and monogramming. Our design consultants work with you to create a garment that reflects your personal style and fits your specific needs.",
    },
    {
      id: "rush-orders",
      category: "orders",
      question: "Do you offer rush orders or expedited service?",
      answer:
        "Yes, we offer expedited service for urgent orders. Rush orders typically take 1-2 weeks instead of our standard 2-4 weeks. Additional fees apply for rush service. Please contact us directly to discuss your timeline and availability.",
    },

    // Measurements
    {
      id: "measurement-guide",
      category: "measurements",
      question: "How do I take accurate measurements?",
      answer:
        "Accurate measurements are crucial for a perfect fit. We provide detailed measurement guides with video tutorials. Key measurements include chest, waist, shoulders, sleeve length, and inseam. For best results, wear form-fitting clothing and use a flexible tape measure. Our stylists are available for virtual consultations to ensure accuracy.",
    },
    {
      id: "measurement-changes",
      category: "measurements",
      question: "Can I change my measurements after placing an order?",
      answer:
        "Yes, you can update your measurements within 24 hours of placing your order. After that, changes may affect production timelines. For significant measurement changes, we may need to restart the production process. Please contact our support team immediately if you need to make changes.",
    },
    {
      id: "size-guide",
      category: "measurements",
      question: "Do you provide size guides for standard sizes?",
      answer:
        "We specialize in custom tailoring, so we don't use standard sizes. Instead, we create garments based on your exact measurements. This ensures the perfect fit for your unique body shape. If you're unsure about measurements, we offer professional measurement services.",
    },
    {
      id: "measurement-consultation",
      category: "measurements",
      question: "Do you offer in-person measurement consultations?",
      answer:
        "Yes, we offer in-person consultations at our Lagos showroom. During your visit, our experienced tailors will take precise measurements and provide styling advice. Virtual consultations are also available for clients outside Lagos. Appointments are recommended and can be booked through our website.",
    },

    // Payment & Pricing
    {
      id: "payment-methods",
      category: "payment",
      question: "What payment methods do you accept?",
      answer:
        "We accept various payment methods including credit/debit cards, bank transfers, and mobile money (for Nigerian customers). For custom orders, we require a 50% deposit to begin production, with the balance due before delivery. All payments are processed securely through our payment partners.",
    },
    {
      id: "pricing-structure",
      category: "payment",
      question: "How is pricing determined for custom garments?",
      answer:
        "Our pricing is based on several factors: fabric selection, complexity of design, customization level, and production time. Base prices start from ₦15,000 for simple shirts to ₦150,000+ for complex suits. Each order receives a detailed quote before production begins.",
    },
    {
      id: "deposit-policy",
      category: "payment",
      question: "What's your deposit and payment policy?",
      answer:
        "We require a 50% deposit to confirm your order and begin production. This deposit is non-refundable once production starts. The remaining balance is due 7 days before delivery. For rush orders, full payment is required upfront. All payments are held securely until order completion.",
    },
    {
      id: "refund-policy",
      category: "payment",
      question: "What's your refund and return policy?",
      answer:
        "Due to the custom nature of our garments, we don't accept returns unless there's a manufacturing defect. If we make an error, we'll repair or remake the garment at no cost. Deposits are non-refundable once production begins. We stand behind our craftsmanship and quality.",
    },

    // Delivery & Shipping
    {
      id: "delivery-time",
      category: "delivery",
      question: "How long does delivery take?",
      answer:
        "Standard delivery takes 2-4 weeks from order confirmation. This includes measurement verification, fabric sourcing, production, and quality checks. Rush orders can be completed in 1-2 weeks. Delivery times may vary during peak seasons. You'll receive tracking information once your order ships.",
    },
    {
      id: "shipping-costs",
      category: "delivery",
      question: "What are the shipping costs?",
      answer:
        "Shipping costs vary by location and delivery method. Lagos deliveries are ₦2,000-₦5,000. Nationwide shipping ranges from ₦4,000-₦9,000 depending on distance. International shipping is calculated based on weight and destination. Free shipping is available for orders over ₦300,000.",
    },
    {
      id: "tracking-orders",
      category: "delivery",
      question: "How can I track my order?",
      answer:
        "Once your order ships, you'll receive a tracking number via email and SMS. You can track your package through our website or the courier's tracking system. We also provide regular updates on your order status through our customer portal.",
    },
    {
      id: "international-shipping",
      category: "delivery",
      question: "Do you ship internationally?",
      answer:
        "Yes, we ship to select international destinations. International shipping typically takes 7-14 days and costs vary by location. Customs duties and taxes are the responsibility of the recipient. Contact us for specific shipping quotes and restrictions for your country.",
    },

    // Account & Support
    {
      id: "create-account",
      category: "account",
      question: "Do I need to create an account to place an order?",
      answer:
        "While you can browse our site without an account, creating one allows you to save measurements, track orders, and receive personalized recommendations. Account creation is free and helps us provide better service. You can also place orders as a guest.",
    },
    {
      id: "contact-support",
      category: "account",
      question: "How can I contact customer support?",
      answer:
        "You can reach our support team through multiple channels: email (support@fashionsmith.com), phone (+234 807 116 7444), WhatsApp, or our contact form. Our response time is typically within 24 hours. For urgent matters, phone support is available during business hours.",
    },
    {
      id: "alterations",
      category: "account",
      question: "Do you offer alterations and repairs?",
      answer:
        "Yes, we offer professional alteration and repair services. Common alterations include hemming, taking in/out, and repairs. Our alteration service starts from ₦5,000 depending on complexity. We recommend trying on your garment and scheduling alterations within 7 days of delivery.",
    },
    {
      id: "loyalty-program",
      category: "account",
      question: "Do you have a loyalty or referral program?",
      answer:
        "Yes! Our loyalty program rewards repeat customers with points for every purchase. Points can be redeemed for discounts on future orders. We also offer referral bonuses when you introduce friends who make their first purchase. Contact us to learn more about our current promotions.",
    },
  ];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.main
      className=" min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section */}
      <motion.div
        className="bg-gradient-to-r from-primary to-secondary text-primary-content py-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="p-4 bg-white/10 rounded-full backdrop-blur-sm"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <QuestionIcon size={48} />
            </motion.div>
          </motion.div>
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            className="text-xl opacity-90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            Find answers to common questions about our custom tailoring
            services, measurements, pricing, and more.
          </motion.p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-16">
        {/* Search and Categories */}
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Search Bar */}
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <MagnifyingGlassIcon
              size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/60"
            />
            <motion.input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-12 pr-4 py-3 text-lg rounded-full shadow-lg focus:shadow-xl transition-shadow"
              whileFocus={{ scale: 1.02 }}
            />
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            className="flex flex-wrap gap-2 justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`btn btn-outline gap-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? "btn-primary text-primary-content shadow-lg scale-105"
                    : "hover:btn-primary hover:scale-105"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.icon}
                {category.label}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="max-w-4xl mx-auto space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {filteredFAQs.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔍
              </motion.div>
              <h3 className="text-2xl font-semibold text-base-content mb-2">
                No results found
              </h3>
              <p className="text-base-content/70">
                Try adjusting your search terms or browse all categories.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  className="bg-base-100 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  layout
                >
                  <motion.button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-base-200/50 transition-colors"
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                  >
                    <h3 className="text-lg font-semibold text-base-content pr-4">
                      {faq.question}
                    </h3>
                    <motion.div
                      className="flex-shrink-0"
                      animate={{ rotate: openItems.has(faq.id) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {openItems.has(faq.id) ? (
                        <CaretUpIcon size={24} className="text-primary" />
                      ) : (
                        <CaretDownIcon
                          size={24}
                          className="text-base-content/60"
                        />
                      )}
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {openItems.has(faq.id) && (
                      <motion.div
                        className="px-6 pb-6 border-t border-base-300"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.p
                          className="text-base-content/80 leading-relaxed pt-4"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          {faq.answer}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="max-w-4xl mx-auto mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 text-center border border-primary/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="p-4 bg-primary/10 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChatCircleIcon size={32} className="text-primary" />
              </motion.div>
            </motion.div>
            <motion.h3
              className="text-2xl font-bold text-base-content mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Still have questions?
            </motion.h3>
            <motion.p
              className="text-base-content/70 mb-6 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Can't find the answer you're looking for? Our friendly support
              team is here to help you with any questions about our services.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <motion.a
                href="/contact"
                className="btn btn-primary btn-lg gap-2 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneIcon size={20} />
                Contact Support
              </motion.a>
              <motion.a
                href="https://wa.me/2348071167444"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg gap-2 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChatCircleIcon size={20} />
                WhatsApp Chat
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="max-w-4xl mx-auto mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              { value: "50+", label: "Happy Customers", color: "text-primary" },
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
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className={`text-3xl font-bold ${stat.color} mb-2`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-base-content/60">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  );
}
