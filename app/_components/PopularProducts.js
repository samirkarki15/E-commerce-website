// components/home/PopularProducts.js - UPDATED WITH BETTER DEBUGGING
"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/app/_components/ProductCard";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  getPopularProducts,
  getPopularCategories,
} from "@/app/_lib/actions/popular-actions";

export default function PopularProducts() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add session check
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  // Fetch popular products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch categories for filter
        const categoriesData = await getPopularCategories();
        setCategories(categoriesData);

        // Fetch products - pass empty string if "all", otherwise pass the category
        const categoryParam = activeFilter === "all" ? "" : activeFilter;

        const productsData = await getPopularProducts(
          visibleCount,
          categoryParam,
        );

        setProducts(productsData);
      } catch (err) {
        setError("Failed to load products. Please try again.");

        // Fallback to mock data if needed
        if (products.length === 0) {
          setProducts(getMockProducts());
          setCategories([
            { id: "all", name: "All Products" },
            { id: "electronics", name: "Electronics" },
            { id: "fashion", name: "Fashion" },
            { id: "home-living", name: "Home & Living" },
            { id: "sports", name: "Sports" },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeFilter, visibleCount]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  // Loading state
  if (isLoading && products.length === 0) {
    return (
      <section className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs md:text-sm font-medium mb-3">
              🔥 Trending Now
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Most Popular Products
            </h2>
            <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
              Loading amazing products...
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 sm:h-80 md:h-96"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <section className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs md:text-sm font-medium mb-3">
            ⚠️ Error
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs md:text-sm font-medium mb-3">
            🔥 Trending Now
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Most Popular Products
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Discover what everyone is buying. These items are flying off the
            shelves!
          </p>
          {/* Debug info for admin */}
          {isAdmin && products.length > 0 && (
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              📊 Showing {products.length} products
            </p>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveFilter(category.id);
                setVisibleCount(8);
              }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                activeFilter === category.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.slice(0, visibleCount).map((product, index) => (
                <div
                  key={product.id}
                  className="group animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {products.length > visibleCount && (
              <div className="text-center mt-8 md:mt-12">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3.5 text-sm md:text-base font-medium text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg"
                >
                  Load More Products
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 md:py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full mb-3 md:mb-4">
              📦
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              No popular products found
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              {isAdmin
                ? "Mark some products as featured, hot, or new to see them here. Make sure to check the checkboxes in the admin panel!"
                : "Check back soon for our featured products!"}
            </p>

            {/* Show admin link ONLY for admin users */}
            {isAdmin ? (
              <Link
                href="/admin/products"
                className="inline-flex items-center justify-center px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200"
              >
                Go to Admin Panel to Add Featured Products
              </Link>
            ) : (
              // Show different message/links for regular customers
              <div className="space-y-3 md:space-y-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 mr-3"
                >
                  Browse All Products
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats Bar */}
        <div className="mt-8 md:mt-16 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-blue-600">
                10K+
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Happy Customers
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-green-600">
                4.8
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Average Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-purple-600">
                24/7
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Customer Support
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-red-600">
                100%
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Secure Payment
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 md:mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3.5 text-sm md:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            View All Products
            <svg
              className="w-4 h-4 md:w-5 md:h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
          <p className="text-xs md:text-sm text-gray-500 mt-3">
            Browse our complete catalog of amazing products
          </p>
        </div>
      </div>
    </section>
  );
}

// Fallback mock data (keep as backup)
function getMockProducts() {
  return [
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      description: "Noise cancelling over-ear headphones",
      price: 89.99,
      originalPrice: 129.99,
      discount: 30,
      rating: 4.5,
      reviewCount: 124,
      soldCount: 450,
      image: "/images/products/headphones.jpg",
      category: "Electronics",
      tags: ["bestseller", "wireless"],
      stock: 25,
      isNew: false,
      isHot: true,
      isFeatured: false,
      slug: "wireless-bluetooth-headphones",
    },
  ];
}
