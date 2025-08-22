import { useQuery } from "@tanstack/react-query";
import {
  StarIcon,
  ShoppingCartIcon,
  ArrowRightIcon,
  SparkleIcon,
  CheckCircleIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

import { productAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function HomePageProducts() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

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

  // Handle adding product to cart
  const handleAddToCart = (product) => {
    const mainImage =
      product.images?.find((img) => img.isMain) || product.images?.[0];
    const imageUrl =
      mainImage?.url || product.image || "/placeholder-product.jpg";

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      category: product.category,
    });
  };

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
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Signature
            </span>
            <br />
            <span className="text-base-content">Pieces</span>
          </h2>

          <p className="text-base md:text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
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
        <div className="space-y-8 md:space-y-10">
          {displayProducts.map((product, index) => {
            const mainImage =
              product.images?.find((img) => img.isMain) || product.images?.[0];
            const imageUrl =
              mainImage?.url || product.image || "/placeholder-product.jpg";
            const isEven = index % 2 === 0;

            return (
              <div
                key={product._id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center ${
                  !isEven ? "lg:grid-flow-col-dense" : ""
                }`}
                style={{
                  animationDelay: `${index * 200}ms`,
                }}
              >
                {/* Product Information */}
                <div
                  className={`space-y-3 md:space-y-4 ${
                    !isEven ? "lg:col-start-2" : ""
                  }`}
                >
                  {/* Product Category & Status */}
                  <div className="flex items-center gap-3">
                    <span className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      {product.category}
                    </span>
                    {product.featured && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <StarIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">Featured</span>
                      </div>
                    )}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-base-content leading-tight">
                    {product.name}
                  </h3>

                  {/* Product Description */}
                  <p className="text-base md:text-lg text-base-content/70 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>

                  {/* Product Features */}
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-base-content flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-success" />
                      What Makes It Special
                    </h4>
                    <div className="grid gap-1.5 text-sm text-base-content/70">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>Premium handcrafted quality</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                        <span>Custom tailored to perfection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                        <span>Traditional meets contemporary design</span>
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button className="btn btn-primary btn-md flex-1 sm:flex-none sm:px-6 group">
                        Order Now
                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                      <button
                        className="btn btn-outline btn-md px-6 group"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCartIcon className="w-4 h-4 mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 pt-3 border-t border-base-300">
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">4.9</div>
                      <div className="text-xs text-base-content/60">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-secondary">
                        50+
                      </div>
                      <div className="text-xs text-base-content/60">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-accent">7-14</div>
                      <div className="text-xs text-base-content/60">Days</div>
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div
                  className={`relative group ${
                    !isEven ? "lg:col-start-1" : ""
                  }`}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-base-200 to-base-300">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-64 md:h-72 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = "/placeholder-product.jpg";
                      }}
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30 transition-all duration-500"></div>

                    {/* Trending Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-gradient-to-r from-primary to-secondary text-white px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
                        <TrendUpIcon className="w-3 h-3" />
                        <span className="text-xs font-medium">Trending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 border border-white/30 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 border border-white/20 rounded-full"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-bold mb-3">
                Explore Our Complete Collection
              </h3>
              <p className="text-base mb-4 opacity-90 max-w-xl mx-auto">
                Discover hundreds of unique designs crafted with passion and
                precision
              </p>
              <button
                onClick={() => navigate("/gallery")}
                className="btn btn-outline btn-md text-white border-white hover:bg-white hover:text-primary"
              >
                View All Products
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
