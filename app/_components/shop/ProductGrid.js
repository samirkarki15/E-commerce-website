// app/_components/shop/ProductGrid.js - WITH IMPROVED SKU DISPLAY
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function ProductGrid({
  products,
  currentPage,
  totalPages,
  totalProducts,
}) {
  const [imageErrors, setImageErrors] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const formatPrice = (price) => {
    return `रु ${Number(price).toLocaleString("en-IN")}`;
  };

  const getProductImageUrl = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];

      if (typeof firstImage === "string" && firstImage.startsWith("http")) {
        return firstImage;
      }

      if (typeof firstImage === "object" && firstImage !== null) {
        return firstImage.url || firstImage.image_url;
      }
    }

    return null;
  };

  const handleImageError = (productId, imageUrl) => {
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  useEffect(() => {
    setImageErrors({});
  }, [products]);

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400 text-xs sm:text-sm">
            ★
          </span>,
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400 text-xs sm:text-sm">
            ★
          </span>,
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300 text-xs sm:text-sm">
            ★
          </span>,
        );
      }
    }
    return stars;
  };

  return (
    <div>
      {/* Responsive grid: 2 columns on mobile, 2 on small tablets, 3 on desktop, 4 on large desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {products.map((product) => {
          const imageUrl = getProductImageUrl(product);
          const hasImageError = imageErrors[product.id];
          const isHovered = hoveredProduct === product.id;

          const discount =
            product.compare_price && product.price < product.compare_price
              ? Math.round(
                  ((product.compare_price - product.price) /
                    product.compare_price) *
                    100,
                )
              : 0;

          // Get rating, review count, sold count, and short description - handle multiple field name variations
          const rating = product.rating ?? product.averageRating ?? 0;
          const reviewCount =
            product.review_count ??
            product.reviewCount ??
            product.totalReviews ??
            0;
          const soldCount = product.sold_count ?? product.soldCount ?? 0;

          const shortDescription = (
            product.short_description ||
            product.shortDescription ||
            product.shortDesc ||
            product.short_desc ||
            ""
          )
            .toString()
            .trim();

          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="block h-full group"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden h-full flex flex-col border border-gray-100 hover:border-blue-200">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {imageUrl && !hasImageError ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className={`object-cover transition-transform duration-500 ${
                          isHovered ? "scale-110" : "scale-100"
                        }`}
                        onError={() => handleImageError(product.id, imageUrl)}
                        priority={
                          currentPage === 1 && products.indexOf(product) < 4
                        }
                      />

                      {/* Overlay on hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl mb-1 sm:mb-2 text-gray-400 animate-pulse">
                          📦
                        </div>
                        <div className="text-xs sm:text-sm font-light text-gray-500">
                          No Image
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Discount Badge - More prominent */}
                  {discount > 0 && (
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
                      <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-md">
                        -{discount}%
                      </span>
                    </div>
                  )}

                  {/* New/Hot Badges */}
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex flex-col gap-0.5 z-10">
                    {product.is_new && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-md">
                        NEW
                      </span>
                    )}
                    {product.is_hot && (
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-md">
                        🔥 HOT
                      </span>
                    )}
                  </div>

                  {product.quantity <= 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                      <span className="text-white font-semibold text-xs sm:text-sm bg-black/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/30">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Quick view indicator - appears on hover */}
                  <div
                    className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-6 pb-2 px-2 transition-opacity duration-300 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="text-white text-[10px] sm:text-xs font-medium flex items-center justify-center gap-1">
                      <span>👁️</span> View Details
                    </span>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 flex-grow flex flex-col bg-white">
                  {/* Brand - More elegant */}
                  <div className="mb-1">
                    <span className="inline-block text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">
                      {product.brand || "Generic"}
                    </span>
                  </div>

                  {/* Product Name - Clean and readable */}
                  <h3 className="font-medium text-gray-900 text-xs sm:text-sm md:text-base leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  {/* Description - Light, elegant font */}
                  <p className="text-gray-500 text-[10px] sm:text-[11px] leading-relaxed line-clamp-2 mb-1.5 sm:mb-2 font-light hidden sm:block">
                    {shortDescription ||
                      (product.description
                        ? product.description.substring(0, 50) + "..."
                        : "No description available")}
                  </p>

                  {/* Rating and Sold Count */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1">
                      <div className="flex">{renderStars(rating)}</div>
                      <span className="text-[9px] sm:text-[10px] text-gray-600">
                        ({reviewCount})
                      </span>
                    </div>
                    {soldCount > 0 && (
                      <span className="text-[9px] sm:text-[10px] text-orange-600 font-medium">
                        🔥 {soldCount} sold
                      </span>
                    )}
                  </div>

                  {/* Price Section */}
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1.5 mb-1.5">
                      <span className="text-sm sm:text-base font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_price &&
                        product.compare_price > product.price && (
                          <span className="text-[9px] sm:text-[10px] text-gray-400 line-through font-light">
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                    </div>

                    {/* Stock Status & SKU - IMPROVED */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-1 h-1 rounded-full ${
                            product.quantity > 10
                              ? "bg-green-500"
                              : product.quantity > 0
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                        <span className="text-[9px] sm:text-[10px] font-light text-gray-500">
                          {product.quantity > 0
                            ? `${product.quantity} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-mono text-gray-900 font-semibold bg-gray-50 px-1.5 py-0.5 rounded">
                        {product.sku || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Button - Appears on hover (desktop only) */}
                  <button className="hidden sm:block w-full mt-2 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:from-blue-700 hover:to-blue-600 hover:shadow-md transform hover:scale-[1.01]">
                    Add to Cart
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile-friendly pagination */}
      {totalPages > 1 && (
        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-1 sm:gap-2">
          {currentPage > 1 && (
            <Link
              href={`/shop?page=${currentPage - 1}`}
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 text-xs sm:text-sm font-medium"
            >
              ← Prev
            </Link>
          )}

          <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Link
                  key={pageNum}
                  href={`/shop?page=${pageNum}`}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          {currentPage < totalPages && (
            <Link
              href={`/shop?page=${currentPage + 1}`}
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 text-xs sm:text-sm font-medium"
            >
              Next →
            </Link>
          )}
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
          <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 animate-bounce">
            😕
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">
            No products found
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 font-light">
            Try adjusting your filters or search term
          </p>
          <a
            href="/shop"
            className="inline-block text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Clear all filters
          </a>
        </div>
      )}
    </div>
  );
}
