import Carousel from "./Carousel";

export default function AppGuide() {
  return (
    <section className="py-6 md:py-12 lg:py-16 px-4 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-base-content mb-4">
            How FashionSmith Works
          </h2>
          <p className="text-base md:text-lg text-base-content/70 max-w-3xl mx-auto leading-relaxed">
            From concept to creation, we've made it simple to get perfectly
            tailored garments. Follow these four easy steps to experience the
            finest in bespoke fashion.
          </p>
        </div>

        {/* Carousel Section */}
        <div className="mb-8 md:mb-12">
          <Carousel />
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary to-secondary p-6 md:p-8 rounded-2xl text-white">
          <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-sm md:text-base mb-4 md:mb-6 opacity-90">
            Join thousands of satisfied customers who trust FashionSmith for
            their bespoke fashion needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <button className="btn btn-outline btn-md md:btn-lg text-white border-white hover:bg-white hover:text-primary">
              Browse Collections
            </button>
            <button className="btn btn-md md:btn-lg bg-white text-primary hover:bg-base-200">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
