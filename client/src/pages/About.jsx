import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();
  return (
    <main className="pt-16 min-h-screen bg-gradient-to-br from-base-100 -mt-15 via-base-200 to-base-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                About FashionSmith
              </h1>
            </div>

            <div className="space-y-6 text-lg leading-relaxed">
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

              <div className="bg-base-200 p-6 rounded-2xl border-l-4 border-primary">
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Our Mission
                </h3>
                <p className="text-base-content/70">
                  To empower individuals with perfectly fitted garments that
                  boost confidence and express personal style, while maintaining
                  the highest standards of quality and sustainability.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-base-content/60">
                  Happy Customers
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">1000+</div>
                <div className="text-sm text-base-content/60">
                  Custom Pieces
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">10+</div>
                <div className="text-sm text-base-content/60">
                  Fabric Options
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-info">24/7</div>
                <div className="text-sm text-base-content/60">Support</div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6 flex justify-center items-center">
              <button
                onClick={() => navigate("/gallery")}
                className="btn btn-primary  w-4/5 btn-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform "
              >
                Start Your Custom Journey
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative">
            <img
              src="/garments.webp"
              alt="FashionSmith Bespoke Suit"
              className="w-full h-full object-cover "
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose FashionSmith?
            </h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">
              We're committed to excellence in every aspect of our service, from
              consultation to final fitting and even after sales service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="card-title justify-center">Quality Assurance</h3>
                <p className="text-base-content/70">
                  Every garment undergoes rigorous quality checks to ensure
                  perfection.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="card-title justify-center">Fast Turnaround</h3>
                <p className="text-base-content/70">
                  Quick delivery without compromising on quality and
                  craftsmanship.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="card-title justify-center">Personal Touch</h3>
                <p className="text-base-content/70">
                  Dedicated consultation and personalized service for every
                  customer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
