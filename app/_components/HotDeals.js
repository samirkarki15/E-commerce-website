// components/home/HotDeals.js
"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/app/_components/ProductCard";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  getHotDeals,
  getHotDealsCategories,
} from "@/app/_lib/actions/hot-deals-actions";

export default function HotDeals() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const [showLoading, setShowLoading] = useState(false);

  // Add session check
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  // Countdown timer for hot deals - Persists across page reloads
  useEffect(() => {
    // Initialize timer from localStorage
    const initializeTimer = () => {
      const savedStartTime = localStorage.getItem("hotDealsStartTime");
      const currentTime = Date.now();

      if (!savedStartTime) {
        // First time - set the start time
        localStorage.setItem("hotDealsStartTime", currentTime.toString());
        setTimeLeft(24 * 60 * 60);
      } else {
        // Calculate elapsed time
        const elapsedMilliseconds = currentTime - parseInt(savedStartTime);
        const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
        const remainingSeconds = Math.max(0, 24 * 60 * 60 - elapsedSeconds);

        if (remainingSeconds === 0) {
          // 24 hours have passed - reset
          localStorage.setItem("hotDealsStartTime", currentTime.toString());
          setTimeLeft(24 * 60 * 60);
        } else {
          setTimeLeft(remainingSeconds);
        }
      }
    };

    initializeTimer();

    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          // Reset after 24 hours
          localStorage.setItem("hotDealsStartTime", Date.now().toString());
          return 24 * 60 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch hot deals products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("🔥 HotDeals: Fetching data...", {
          activeFilter,
          visibleCount,
          isAdmin,
        });

        // Fetch categories for filter
        const categoriesData = await getHotDealsCategories();
        console.log("🔥 HotDeals: Categories fetched", categoriesData);
        setCategories(categoriesData);

        // Fetch products
        const categoryParam = activeFilter === "all" ? "" : activeFilter;
        console.log(
          "🔥 HotDeals: Fetching hot deals with category:",
          categoryParam,
        );

        const productsData = await getHotDeals(visibleCount, categoryParam);

        console.log("🔥 HotDeals: Products fetched", {
          count: productsData.length,
          products: productsData,
        });

        setProducts(productsData);

        if (productsData.length === 0) {
          console.warn("⚠️ No hot deal products returned");
        }
      } catch (err) {
        console.error("❌ Error fetching hot deals:", err);
        setError("Failed to load hot deals. Please try again.");

        // Fallback to empty state (not mock data for hot deals)
        if (products.length === 0) {
          console.log("📍 No fallback data for hot deals");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeFilter, visibleCount]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  // Loading state - Only show if loading takes more than 800ms (best UX practice)
  useEffect(() => {
    let loadingTimer;
    if (isLoading && products.length === 0) {
      // Only show loading skeleton if it takes more than 800ms
      loadingTimer = setTimeout(() => {
        setShowLoading(true);
      }, 800);
    } else {
      setShowLoading(false);
    }
    return () => clearTimeout(loadingTimer);
  }, [isLoading, products.length]);

  if (showLoading && products.length === 0) {
    return (
      <section className="py-8 md:py-12 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                🔥 Hot Deals
              </h2>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Limited time offers. Don't miss out!
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-lg border-2 border-red-200">
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                Offer ends in:
              </p>
              <div className="text-2xl md:text-3xl font-bold text-red-600 mt-1 font-mono">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 sm:h-64 md:h-80"></div>
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
      <section className="py-8 md:py-12 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs md:text-sm font-medium mb-3">
            ⚠️ Error
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm md:text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header with Timer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-6">
          <div>
            <div className="inline-flex items-center justify-center px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs md:text-sm font-medium mb-2 md:mb-3">
              🔥 Limited Time
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
              Hot Deals & Offers
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Massive discounts on selected products. Hurry, limited stock!
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-5 shadow-lg border-2 border-red-200">
              <p className="text-xs md:text-sm text-gray-500 font-medium text-center">
                ⏰ Offer ends in:
              </p>
              <div className="text-2xl md:text-3xl font-bold text-red-600 mt-2 text-center font-mono">
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">HH:MM:SS</p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  console.log("🔥 Filter changed to:", category.id);
                  setActiveFilter(category.id);
                  setVisibleCount(8);
                }}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                  activeFilter === category.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid - 2 cols on mobile, 3 on tablet, 4 on desktop */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.slice(0, visibleCount).map((product, index) => (
                <div
                  key={product.id}
                  className="group animate-fadeIn relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hot Deal Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                      <div className="bg-red-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                        -{product.discount}%
                      </div>
                    </div>
                  )}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {products.length > visibleCount && (
              <div className="text-center mt-8 md:mt-12">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3.5 text-sm md:text-base font-medium text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 border-2 border-red-200 hover:border-red-300 hover:shadow-lg"
                >
                  Load More Hot Deals
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
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-red-100 rounded-full mb-3 md:mb-4">
              🔥
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              No hot deals available right now
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              {isAdmin
                ? "Mark some products as 'Hot Product' with a discount to see them here."
                : "Check back soon for amazing hot deals!"}
            </p>

            {/* Show admin link ONLY for admin users */}
            {isAdmin ? (
              <Link
                href="/admin/products"
                className="inline-flex items-center justify-center px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200"
              >
                Go to Admin Panel to Add Hot Deals
              </Link>
            ) : (
              // Show different message/links for regular customers
              <div className="space-y-3 md:space-y-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 mr-3"
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

        {/* Hot Deals Info Banner */}
        <div className="mt-8 md:mt-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl md:rounded-2xl p-6 md:p-8 text-white">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                50%+
              </div>
              <p className="text-xs md:text-base text-red-100">
                Average Discount
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                ⚡
              </div>
              <p className="text-xs md:text-base text-red-100">Limited Stock</p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                24H
              </div>
              <p className="text-xs md:text-base text-red-100">
                Limited Time Offer
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 md:mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3.5 text-sm md:text-base font-medium text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Shop All Hot Deals
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
          <p className="text-xs md:text-sm text-gray-600 mt-3">
            Don't miss out on these amazing deals!
          </p>
        </div>
      </div>
    </section>
  );
}
