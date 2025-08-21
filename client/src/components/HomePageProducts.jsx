import { useQuery } from "@tanstack/react-query";
import { productAPI } from "../services/api";
import {
  StarIcon,
  ShoppingCartIcon,
  ArrowRightIcon,
  SparkleIcon,
  CheckCircleIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

export default function HomePageProducts() {
  // Fetch products from API
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: productAPI.getProducts,
  });

  const products = productsData?.data?.data || [];

  // Filter for specific products (suit, kaftan, agbada)
  const featuredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes("suit") ||
        product.name.toLowerCase().includes("kaftan") ||
        product.name.toLowerCase().includes("agbada")
    )
    .slice(0, 3); // Limit to 3 products

  // Fallback to first 3 products if specific ones not found
  const displayProducts =
    featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-base-100 to-base-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/60">Loading featured products...</p>
        </div>
      </section>
    );
  }

  if (error || displayProducts.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto  relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-base-content mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Signature
            </span>
            <br />
            <span className="text-base-content">Pieces</span>
          </h2>

          <p className="text-lg md:text-xl text-base-content/70 max-w-3xl mx-auto leading-relaxed">
            Discover our most sought-after designs that blend
            <span className="text-primary font-semibold">
              {" "}
              traditional elegance{" "}
            </span>
            with
            <span className="text-secondary font-semibold">
              {" "}
              contemporary sophistication
            </span>
          </p>
        </div>

        {/* Products Display */}
        <div className="space-y-12 md:space-y-16 ">
          {displayProducts.map((product, index) => {
            const mainImage =
              product.images?.find((img) => img.isMain) || product.images?.[0];
            const imageUrl =
              mainImage?.url || product.image || "/placeholder-product.jpg";
            const isEven = index % 2 === 0;

            return (
              <div
                key={product._id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center  ${
                  !isEven ? "lg:grid-flow-col-dense" : ""
                }`}
                style={{
                  animationDelay: `${index * 200}ms`,
                }}
              >
                {/* Product Information */}
                <div
                  className={`space-y-4 md:space-y-6 ${
                    !isEven ? "lg:col-start-2" : ""
                  }`}
                >
                  {/* Product Category & Status */}
                  <div className="flex items-center gap-3">
                    <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {product.category}
                    </span>
                    {product.featured && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <StarIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Featured</span>
                      </div>
                    )}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content leading-tight">
                    {product.name}
                  </h3>

                  {/* Product Description */}
                  <p className="text-lg md:text-xl text-base-content/70 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Product Features */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-base-content flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                      What Makes It Special
                    </h4>
                    <div className="grid gap-2 text-base-content/70">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Premium handcrafted quality</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        <span>Custom tailored to perfection</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span>Traditional meets contemporary design</span>
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="btn btn-primary btn-lg flex-1 sm:flex-none sm:px-8 group">
                        Order Now
                        <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                      <button className="btn btn-outline btn-lg px-8 group">
                        <ShoppingCartIcon className="w-5 h-5 mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8 pt-4 border-t border-base-300">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">4.9</div>
                      <div className="text-sm text-base-content/60">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        50+
                      </div>
                      <div className="text-sm text-base-content/60">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">7-14</div>
                      <div className="text-sm text-base-content/60">Days</div>
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div
                  className={`relative group ${
                    !isEven ? "lg:col-start-1" : ""
                  }`}
                >
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-base-200 to-base-300">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-80 md:h-96 lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = "/placeholder-product.jpg";
                      }}
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30 transition-all duration-500"></div>

                    {/* Floating Price Badge */}
                    <div className="absolute top-6 right-6">
                      <div className="bg-white/90 backdrop-blur-md text-base-content px-4 py-2 rounded-full font-bold shadow-xl border border-white/30">
                        ₦{product.basePrice?.toLocaleString()}
                      </div>
                    </div>

                    {/* Trending Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-2 rounded-full flex items-center gap-2 shadow-xl">
                        <TrendUpIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Trending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-20 md:mt-24 text-center">
          <div className="bg-gradient-to-r from-primary to-secondary p-8 md:p-12 rounded-3xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 border border-white/30 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 border border-white/20 rounded-full"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Explore Our Complete Collection
              </h3>
              <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                Discover hundreds of unique designs crafted with passion and
                precision
              </p>
              <button className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary">
                View All Products
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
