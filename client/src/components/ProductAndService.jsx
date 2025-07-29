import { useState } from "react";
import {
  ShirtFoldedIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  WrenchIcon,
  ScissorsIcon,
  RulerIcon,
  SparkleIcon,
  CrownIcon,
  SuitcaseIcon,
  ShoppingCartIcon,
} from "@phosphor-icons/react";

const products = [
  {
    id: 1,
    name: "Kaftans",
    image: "/kaftans.webp",
    price: "From ₦60,000",
    category: "Traditional",
    icon: <CrownIcon size={24} />,
    color: "from-amber-500 to-orange-500",
  },
  {
    id: 2,
    name: "Tailored Suits",
    image: "suit.jpg",
    price: "From ₦90,000",
    category: "Formal",
    icon: <SuitcaseIcon size={24} />,
    color: "from-slate-600 to-gray-800",
  },
  {
    id: 4,
    name: "Custom Shirts",
    image: "shirt.jpeg",
    price: "From ₦20,000",
    category: "Formal",
    icon: <ShirtFoldedIcon size={24} />,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 6,
    name: "Casual Shirts",
    image:
      "https://images.unsplash.com/photo-1564257577633-15999cec5fff?w=400&h=500&fit=crop",
    price: "From ₦20,000",
    category: "Casual",
    icon: <ShirtFoldedIcon size={24} />,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 7,
    name: "Tailored Trousers",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop",
    price: "From ₦20,000",
    category: "Formal",
    icon: <RulerIcon size={24} />,
    color: "from-purple-600 to-violet-700",
  },
  {
    id: 9,
    name: "Tailored Trousers",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop",
    price: "From ₦20,000",
    category: "Casual",
    icon: <RulerIcon size={24} />,
    color: "from-purple-600 to-violet-700",
  },
  {
    id: 10,
    name: "Waistcoats",
    image:
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=500&fit=crop",
    price: "From ₦11,000",
    category: "Formal",
    icon: <SparkleIcon size={24} />,
    color: "from-rose-500 to-pink-600",
  },
  {
    id: 11,
    name: "Royal Agbadas",
    image: "agbada.jpg",
    price: "From ₦90,000",
    category: "Traditional",
    icon: <CrownIcon size={24} />,
    color: "from-yellow-500 to-amber-600",
  },
];

const services = [
  {
    id: 1,
    name: "Professional Fittings",
    description:
      "Expert measurement sessions to ensure your garments fit like a glove",
    icon: <RulerIcon size={32} />,
    features: [
      "Comprehensive body measurements",
      "Posture and fit analysis",
      "Style consultation",
      "Follow-up adjustments",
    ],
    price: "₦15,000",
    duration: "45 minutes",
    color: "bg-primary",
  },
  {
    id: 2,
    name: "Amendments & Alterations",
    description:
      "Modify existing garments to achieve the perfect fit and style",
    icon: <ScissorsIcon size={32} />,
    features: [
      "Size adjustments",
      "Style modifications",
      "Fabric updates",
      "Quality restoration",
    ],
    price: "From ₦8,000",
    duration: "1-3 days",
    color: "bg-secondary",
  },
  {
    id: 3,
    name: "Garment Repairs",
    description: "Restore your favorite pieces to their original glory",
    icon: <WrenchIcon size={32} />,
    features: [
      "Seam repairs",
      "Button replacement",
      "Zipper fixes",
      "Fabric patching",
    ],
    price: "From ₦5,000",
    duration: "1-2 days",
    color: "bg-accent",
  },
];

export default function ProductAndService() {
  const [activeTab, setActiveTab] = useState("products");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Traditional", "Formal", "Casual"];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <section className="py-6 md:py-12 lg:py-16 px-4 bg-gradient-to-br from-base-100 via-base-200 to-base-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-base-content mb-4 md:mb-6">
            Products & Services
          </h2>
          <p className="text-lg md:text-xl text-base-content/70 max-w-3xl mx-auto leading-relaxed">
            Discover our exquisite collection of bespoke garments and
            professional services, crafted with precision and passion to elevate
            your style.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="bg-base-100 p-1.5 md:p-2 rounded-2xl shadow-lg border border-base-300">
            <div className="flex gap-1.5 md:gap-2">
              <button
                onClick={() => setActiveTab("products")}
                className={`px-6 md:px-8 py-4 md:py-4 rounded-xl font-semibold transition-all duration-300 text-base md:text-base min-h-12 md:min-h-auto ${
                  activeTab === "products"
                    ? "bg-primary text-primary-content shadow-lg transform scale-105"
                    : "text-base-content hover:bg-base-200"
                }`}
              >
                Our Products
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`px-6 md:px-8 py-4 md:py-4 rounded-xl font-semibold transition-all duration-300 text-base md:text-base min-h-12 md:min-h-auto ${
                  activeTab === "services"
                    ? "bg-primary text-primary-content shadow-lg transform scale-105"
                    : "text-base-content hover:bg-base-200"
                }`}
              >
                Our Services
              </button>
            </div>
          </div>
        </div>

        {/* Products Section */}
        {activeTab === "products" && (
          <div className="space-y-8 md:space-y-12">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 md:px-6 py-3 md:py-3 rounded-full font-medium transition-all duration-300 text-base md:text-base min-h-12 md:min-h-10 ${
                    selectedCategory === category
                      ? "bg-primary text-primary-content shadow-lg transform scale-105"
                      : "bg-base-100 text-base-content hover:bg-base-200 shadow-md"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 h-80 md:h-96 lg:h-[400px]"
                >
                  {/* Full Height Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-500"></div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="glass bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg border border-white/30">
                      {product.category}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="glass bg-white/20 backdrop-blur-md text-white p-2 rounded-full border border-white/30">
                      {product.icon}
                    </div>
                  </div>

                  {/* Glass Card Content - Floating at Bottom */}
                  <div className="absolute bottom-3 md:bottom-5 left-3 md:left-5 right-3 md:right-5 z-20">
                    <div className="glass bg-white/10 rounded-xl backdrop-blur-3xl border-t border-white/20 p-3 md:p-4 lg:p-6 text-white">
                      {/* Price Badge */}
                      <div className="absolute -top-2 md:-top-3 right-2 md:right-4">
                        <span className="bg-primary text-primary-content px-2 md:px-4 py-1 md:py-2 rounded-full font-bold shadow-lg text-xs md:text-sm">
                          {product.price}
                        </span>
                      </div>

                      <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 md:mb-3 group-hover:text-primary-content transition-colors duration-300">
                        {product.name}
                      </h3>

                      {/* Action Buttons */}
                      <div className="flex gap-1.5 md:gap-2">
                        <button className="btn btn-primary btn-sm md:btn-sm flex-1 text-sm md:text-xs min-h-10 md:min-h-8">
                          Order Now
                        </button>
                        <button className="btn btn-outline btn-primary btn-sm md:btn-sm px-3 md:px-3 text-white border-white hover:bg-white hover:text-primary min-h-10 md:min-h-8">
                          <ShoppingCartIcon size={16} className="md:hidden" />
                          <ShoppingCartIcon
                            size={14}
                            className="hidden md:block"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Section */}
        {activeTab === "services" && (
          <div className="space-y-8 md:space-y-12">
            <div className="text-center mb-8 md:mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-base-content mb-4">
                Professional Tailoring Services
              </h3>
              <p className="text-base md:text-lg text-base-content/70 max-w-2xl mx-auto">
                Expert craftsmanship and attention to detail in every service we
                provide
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-base-100 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2"
                >
                  {/* Header */}
                  <div
                    className={`${service.color} text-white p-4 md:p-6 lg:p-8 relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 opacity-10 transform rotate-12 translate-x-4 -translate-y-4">
                      <div className="text-6xl md:text-8xl">{service.icon}</div>
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="bg-white/20 backdrop-blur-sm p-2 md:p-3 rounded-full">
                          {service.icon}
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl lg:text-2xl font-bold">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-2 md:gap-4 text-white/80 text-xs md:text-sm mt-1">
                            <span>💰 {service.price}</span>
                            <span>⏰ {service.duration}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-white/90 leading-relaxed text-sm md:text-base">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 md:p-6 lg:p-8">
                    <h4 className="font-semibold text-base-content mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                      <StarIcon
                        size={16}
                        className="md:hidden text-yellow-500"
                      />
                      <StarIcon
                        size={18}
                        className="hidden md:block text-yellow-500"
                      />
                      What's Included:
                    </h4>

                    <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                      {service.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 md:gap-3"
                        >
                          <CheckCircleIcon
                            size={16}
                            className="text-success flex-shrink-0 mt-0.5 md:hidden"
                          />
                          <CheckCircleIcon
                            size={18}
                            className="text-success flex-shrink-0 mt-0.5 hidden md:block"
                          />
                          <span className="text-base-content/70 text-sm md:text-base">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button className="btn btn-primary w-full btn-md md:btn-md group-hover:shadow-lg transition-shadow duration-300 min-h-12">
                      Book Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 md:mt-16 lg:mt-20 text-center bg-gradient-to-r from-primary to-secondary p-6 md:p-8 lg:p-12 rounded-3xl text-white shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Ready to Elevate Your Style?
          </h3>
          <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90 max-w-2xl mx-auto">
            Experience the perfect blend of traditional craftsmanship and modern
            design. Let FashionSmith create something extraordinary for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <button className="btn btn-outline btn-lg md:btn-lg text-white border-white hover:bg-white hover:text-primary min-h-12">
              Schedule Consultation
            </button>
            <button className="btn btn-lg md:btn-lg bg-white text-primary hover:bg-base-200 min-h-12">
              View Gallery
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
