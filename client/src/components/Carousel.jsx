import { useRef, useState } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  StarIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";

const guideSteps = [
  {
    step: 1,
    image: "/selection.webp",
    caption: "Browse Collections",
    title: "Browse Our Collections",
    description:
      "Explore our curated fashion collections and services to find your perfect style",
    features: ["Premium Fabrics", "Latest Trends", "Traditional & Modern"],
    color: "from-primary/10 to-primary/5",
  },
  {
    step: 2,
    image: "/tape.webp",
    caption: "Get Measured",
    title: "Professional Measurements",
    description:
      "Take accurate measurements with our guides or request professional fitting service",
    features: ["Expert Guidance", "Precision Tools", "Perfect Fit Guarantee"],
    color: "from-secondary/10 to-secondary/5",
  },
  {
    step: 3,
    image: "/customize.png",
    caption: "Customize & Order",
    title: "Customize Your Design",
    description:
      "Choose your preferences, customize details, and place your order with confidence",
    features: ["Personal Touch", "Color Options", "Style Variations"],
    color: "from-accent/10 to-accent/5",
  },
  {
    step: 4,
    image: "/secure.png",
    caption: "Secure Payments",
    title: "Secure Make Payments",
    description:
      "Make secure payments with our trusted payment gateways for a smooth transaction",
    features: ["Bank Transfer", "Card Payments", "Installment Plans"],
    color: "from-success/10 to-success/5",
  },
  {
    step: 5,
    image: "/delivery.jpg",
    caption: "Track & Receive",
    title: "Track & Receive Your Order",
    description:
      "Monitor your order progress in real-time and receive your perfectly fitted garments",
    features: ["Real-time Updates", "Quality Check", "Timely Delivery"],
    color: "from-info/10 to-info/5",
  },
];

export default function Carousel() {
  const scrollRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.children[0]?.offsetWidth || 0;
      const gap = 16;
      const scrollAmount = slideWidth + gap;

      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      // Update current slide index
      if (direction === "left") {
        setCurrentSlide((prev) =>
          prev === 0 ? guideSteps.length - 1 : prev - 1
        );
      } else {
        setCurrentSlide((prev) =>
          prev === guideSteps.length - 1 ? 0 : prev + 1
        );
      }
    }
  };

  const goToSlide = (index) => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.children[0]?.offsetWidth || 0;
      const gap = 16;
      const scrollAmount = (slideWidth + gap) * index;

      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
      setCurrentSlide(index);
    }
  };

  return (
    <div className="relative w-full lg:w-2/3 max-w-6xl mx-auto overflow-hidden">
      {/* Carousel container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {guideSteps.map((slide, index) => (
          <div
            key={slide.step}
            className="snap-center shrink-0 w-full bg-base-100 rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500"
          >
            {/* Image Section with Overlay */}
            <div className="relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${slide.color} z-10`}
              ></div>
              <img
                src={slide.image}
                alt={slide.caption}
                className="w-full h-80 md:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Progress Indicator */}
              <div className="absolute top-6 right-6 z-20">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                  {index + 1} of {guideSteps.length}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-3 md:p-4 lg:p-6">
              <div className="mb-3 md:mb-2">
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-base-content mb-1 md:mb-2 group-hover:text-primary transition-colors duration-300">
                  {slide.title}
                </h3>
                <p className="text-base-content/70 leading-relaxed text-sm md:text-base lg:text-lg">
                  {slide.description}
                </p>
              </div>

              {/* Features List */}
              <div className="mb-4 md:mb-6">
                <h4 className="font-semibold text-base-content mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                  <StarIcon size={16} className="text-yellow-500 md:hidden" />
                  <StarIcon
                    size={18}
                    className="text-yellow-500 hidden md:block"
                  />
                  Key Features:
                </h4>
                <div className="space-y-1.5 md:space-y-2 flex gap-4 ">
                  {slide.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex flex-row items-center gap-2 text-base-content/70"
                    >
                      <CheckCircleIcon
                        size={14}
                        className="text-success flex-shrink-0 md:hidden"
                      />
                      <CheckCircleIcon
                        size={16}
                        className="text-success flex-shrink-0 hidden md:block"
                      />
                      <span className="text-xs md:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Navigation Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 md:left-4 top-1/3 md:top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2 md:p-4 rounded-full shadow-2xl z-30 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-200"
        aria-label="Previous step"
      >
        <CaretLeftIcon size={20} className="text-gray-800 md:hidden" />
        <CaretLeftIcon size={24} className="text-gray-800 hidden md:block" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-2 md:right-4 top-1/3 md:top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2 md:p-4 rounded-full shadow-2xl z-30 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-gray-200"
        aria-label="Next step"
      >
        <CaretRightIcon size={20} className="text-gray-800 md:hidden" />
        <CaretRightIcon size={24} className="text-gray-800 hidden md:block" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        {guideSteps.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-primary shadow-lg scale-125"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to step ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
