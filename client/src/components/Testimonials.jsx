import { useState, useEffect } from "react";
import {
  StarIcon,
  QuotesIcon,
  UserIcon,
  CheckCircleIcon,
  HeartIcon,
} from "@phosphor-icons/react";

const testimonials = [
  {
    id: 1,
    name: "Adebayo Ogundimu",
    location: "Lagos, Nigeria",
    rating: 5,
    text: "FashionSmith transformed my wardrobe completely! The attention to detail in my bespoke suits is exceptional. Every stitch speaks of quality and craftsmanship. I've never felt more confident in my business meetings.",
  },

  {
    id: 2,
    name: "Ibrahim Musa",
    location: "Kano, Nigeria",
    rating: 5,
    text: "Outstanding service from start to finish! The team guided me through every step of the process. My custom kaftan fits perfectly and the fabric quality is top-notch. Highly recommend FashionSmith!",
  },
  {
    id: 3,
    name: "Oluwasegun Ogungbemi",
    location: "Lagos, Nigeria",
    rating: 5,
    text: "Professional, timely, and absolutely beautiful work! FashionSmith created the perfect blazer set that makes me stand out in the courtroom. The fit is impeccable and the attention to detail is remarkable.",
  },
  {
    id: 4,
    name: "Chinedu Okafor",
    location: "Enugu, Nigeria",
    rating: 5,
    text: "From consultation to delivery, everything was seamless. My custom shirts are perfectly tailored and the fabric choices are premium. FashionSmith truly understands modern Nigerian fashion needs.",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

  // Get testimonials to display (current + next 2 for larger screens)
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="py-12 md:py-16 lg:py-20 px-4 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              What Our Clients
            </span>
            <br />
            <span className="text-base-content">Say About Us</span>
          </h2>

          <p className="text-base md:text-lg lg:text-xl text-base-content/70 max-w-3xl mx-auto leading-relaxed">
            Discover why thousands of Nigerians trust FashionSmith for their
            bespoke fashion needs. Real stories from real customers who
            experienced our exceptional craftsmanship.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-6 md:mt-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                50+
              </div>
              <div className="text-sm text-base-content/60">
                Happy Customers
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-secondary">
                4.9
              </div>
              <div className="text-sm text-base-content/60">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">
                98%
              </div>
              <div className="text-sm text-base-content/60">
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Mobile View - Single Testimonial */}
          <div className="md:hidden">
            <div className="bg-base-100 rounded-2xl shadow-xl p-6 border border-base-200">
              <div className="mb-4">
                <h4 className="font-bold text-lg text-base-content mb-1">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-sm text-base-content/60 mb-2">
                  {testimonials[currentIndex].location}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      size={18}
                      weight="fill"
                      className={
                        i < testimonials[currentIndex].rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="ml-2 text-sm text-base-content/60 font-medium">
                    {testimonials[currentIndex].rating}.0
                  </span>
                </div>
              </div>

              {/* Quote */}
              <div className="relative">
                <QuotesIcon
                  size={28}
                  className="text-primary/20 absolute -top-2 -left-1"
                />
                <p className="text-base-content/80 leading-relaxed pl-8 text-base italic">
                  "{testimonials[currentIndex].text}"
                </p>
              </div>
            </div>
          </div>

          {/* Desktop View - Multiple Testimonials */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`bg-base-100 rounded-2xl shadow-xl p-6 border border-base-200 transition-all duration-500 hover:shadow-2xl hover:scale-105 ${
                  index === 0 ? "scale-105 shadow-2xl border-primary/20" : ""
                }`}
              >
                <div className="mb-4">
                  <h4 className="font-bold text-base-content mb-1">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-base-content/60 mb-2">
                    {testimonial.location}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        size={16}
                        weight="fill"
                        className={
                          i < testimonial.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    <span className="ml-1 text-xs text-base-content/60 font-medium">
                      {testimonial.rating}.0
                    </span>
                  </div>
                </div>

                {/* Quote */}
                <div className="relative">
                  <QuotesIcon
                    size={24}
                    className="text-primary/20 absolute -top-1 -left-1"
                  />
                  <p className="text-base-content/80 leading-relaxed text-sm pl-6 line-clamp-4 italic">
                    "{testimonial.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="btn btn-circle btn-outline hover:btn-primary transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Indicators */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary scale-125 shadow-lg"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="btn btn-circle btn-outline hover:btn-primary transition-all duration-300"
              aria-label="Next testimonial"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8 md:mt-12">
            <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 rounded-2xl text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
                Ready to Join Our Happy Customers?
              </h3>
              <p className="text-base md:text-lg mb-4 md:mb-6 opacity-90 max-w-2xl mx-auto">
                Experience the same exceptional craftsmanship and personalized
                service that our customers rave about.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
                <button className="btn btn-outline btn-lg sm:btn-md text-white border-white hover:bg-white hover:text-primary min-h-[56px] sm:min-h-auto text-base font-semibold">
                  Start Your Order
                </button>
                <button className="btn btn-lg sm:btn-md bg-white text-primary hover:bg-base-200 min-h-[56px] sm:min-h-auto text-base font-semibold">
                  View Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
