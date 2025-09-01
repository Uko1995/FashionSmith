import Carousel from "./Carousel";

export default function AppGuide() {
  return (
    <section className="py-8 md:py-12 px-4 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-base-content mb-2 md:mb-3">
            How It Works
          </h2>
          <p className="text-sm md:text-base text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            Simple steps to get your perfect bespoke garments crafted by expert
            tailors.
          </p>
        </div>

        {/* Carousel Section */}
        <div className="mb-6 md:mb-8">
          <Carousel />
        </div>

        {/* Compact Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary to-secondary p-4 md:p-6 rounded-xl text-white">
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">
            Ready to Start Your Journey?
          </h3>
          <p className="text-xs md:text-sm mb-3 md:mb-4 opacity-90 max-w-md mx-auto">
            Join satisfied customers who trust FashionSmith for bespoke fashion.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center max-w-md mx-auto">
            <button className="btn btn-outline btn-sm md:btn-md text-white border-white hover:bg-white hover:text-primary flex-1">
              Browse Collections
            </button>
            <button className="btn btn-sm md:btn-md bg-white text-primary hover:bg-base-200 flex-1">
              Get Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
