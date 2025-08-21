import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productAPI } from "../services/api";
import {
  StarIcon,
  ShoppingCartIcon,
  ImageIcon,
  SparkleIcon,
  HeartIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

export default function ProductAndService() {
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  // Extract unique categories from products
  const uniqueCategories = [
    ...new Set(products.map((product) => product.category)),
  ];
  const categories = ["All", ...uniqueCategories];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <section className="py-4 md:py-8 lg:py-12 px-4 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-6 md:mb-8 lg:mb-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Exquisite
            </span>
            {"    "}
            <span className="text-base-content">Products</span>
          </h2>

          <p className="text-base md:text-lg lg:text-xl text-base-content/70 max-w-3xl mx-auto leading-relaxed">
            Discover our handcrafted collection of bespoke garments, where
            <span className="text-primary font-semibold">
              {" "}
              traditional artistry{" "}
            </span>
            meets
            <span className="text-secondary font-semibold">
              {" "}
              contemporary elegance
            </span>
          </p>

          {/* Stats Section */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-4 md:mt-6">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-primary">
                {products.length}+
              </div>
              <div className="text-xs text-base-content/60">
                Premium Products
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-secondary">
                {categories.length - 1}+
              </div>
              <div className="text-xs text-base-content/60">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-accent">
                100%
              </div>
              <div className="text-xs text-base-content/60">Handcrafted</div>
            </div>
          </div>
        </div>
        {/* Enhanced Category Filter */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`group relative px-4 md:px-6 py-2 md:py-3 rounded-2xl font-semibold transition-all duration-500 text-sm md:text-base overflow-hidden ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-xl transform scale-105"
                    : "bg-base-100 text-base-content hover:bg-base-200 shadow-lg hover:shadow-xl hover:scale-105"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {selectedCategory === category && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse"></div>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {category === "All" && <TrendUpIcon className="w-4 h-4" />}
                  {category}
                  {selectedCategory === category && (
                    <HeartIcon className="w-4 h-4 animate-bounce" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Products Grid */}
        <div className="mt-6 md:mt-8">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
              <p className="text-base-content/60">
                Loading our beautiful products...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="alert alert-error max-w-md mx-auto shadow-xl">
                <span>Failed to load products. Please try again later.</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-base-100 rounded-3xl shadow-xl p-12 max-w-md mx-auto">
                <ImageIcon className="w-20 h-20 mx-auto text-base-content/40 mb-6" />
                <h3 className="text-xl font-bold text-base-content mb-2">
                  {selectedCategory === "All"
                    ? "No Products Available"
                    : "Category Empty"}
                </h3>
                <p className="text-base-content/60">
                  {selectedCategory === "All"
                    ? "Our collection is being updated. Check back soon!"
                    : `No products found in "${selectedCategory}" category. Try another category.`}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Products Count */}
              <div className="text-center mb-8">
                <p className="text-base-content/60">
                  Showing{" "}
                  <span className="font-semibold text-primary">
                    {filteredProducts.length}
                  </span>
                  {selectedCategory === "All"
                    ? " products"
                    : ` products in "${selectedCategory}"`}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => {
                  const mainImage =
                    product.images?.find((img) => img.isMain) ||
                    product.images?.[0];
                  const imageUrl =
                    mainImage?.url ||
                    product.image ||
                    "/placeholder-product.jpg";

                  return (
                    <div
                      key={product._id}
                      className="group relative rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden hover:-translate-y-3 bg-base-100"
                      style={{
                        animationDelay: `${index * 150}ms`,
                      }}
                    >
                      {/* Image Container */}
                      <div className="relative h-80 md:h-100 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.src = "/placeholder-product.jpg";
                          }}
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent group-hover:from-black/60 transition-all duration-500"></div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-20">
                          <div className="bg-white/10 backdrop-blur-3xl rounded-2xl p-3 border border-white/20 shadow-2xl">
                            {/* Badges Section */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                {/* Category Badge */}
                                <span className="bg-white/90 backdrop-blur-md text-base-content px-2 py-1 rounded-full text-xs font-bold shadow-lg border border-white/30">
                                  {product.category}
                                </span>

                                {/* Featured Badge */}
                                {product.featured && (
                                  <div className="bg-gradient-to-r from-primary to-secondary p-1.5 rounded-full shadow-lg">
                                    <StarIcon className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>

                              {/* Price Badge */}
                              <div className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full font-bold shadow-xl text-base backdrop-blur-md">
                                ₦{product.basePrice?.toLocaleString() || "N/A"}
                              </div>
                            </div>

                            <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary-content transition-colors duration-300">
                              {product.name}
                            </h3>

                            <p className="text-sm text-white/90 mb-3 line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button className="btn btn-primary flex-1 btn-sm hover:btn-secondary transition-all duration-300 shadow-lg">
                                Order Now
                              </button>
                              <button className="btn btn-outline btn-sm px-3 text-white border-white/50 hover:bg-white hover:text-primary hover:border-white transition-all duration-300">
                                <ShoppingCartIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Enhanced Call to Action */}
        <div className="mt-8 md:mt-12 text-center relative">
          <div className="bg-gradient-to-r from-primary via-secondary to-primary p-6 md:p-8 lg:p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 border border-white/30 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 border border-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/10 rounded-full"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                Ready to Elevate Your Style?
              </h3>
              <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Experience the perfect blend of traditional craftsmanship and
                modern design. Let FashionSmith create something extraordinary
                for you.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
                <button className="btn btn-outline btn-lg text-white border-white/70 hover:bg-white hover:text-primary hover:border-white transition-all duration-300 shadow-xl backdrop-blur-md">
                  Schedule Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
