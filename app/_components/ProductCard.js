// components/products/ProductCard.js - WITH RATINGS AND SOLD COUNT - FIXED
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { addToCart } from "@/app/_lib/actions/cart-actions";
import { useCart } from "@/app/_context/CartContext";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { data: session, status } = useSession();
  const { refreshCart } = useCart();

  // Calculate savings
  const savings =
    (product.originalPrice || product.compare_price || 0) -
    (product.price || 0);
  const savingsPercentage = product.compare_price
    ? Math.round(
        ((product.compare_price - product.price) / product.compare_price) * 100,
      )
    : 0;

  // Get rating, review count, sold count, and short description - handle multiple field name variations
  const rating = product.rating ?? product.averageRating ?? 0;
  const reviewCount =
    product.review_count ?? product.reviewCount ?? product.totalReviews ?? 0;
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

  // Debug logging (remove in production)
  // console.log("ProductCard Debug:", { rating, reviewCount, soldCount, product });

  // Handle image loading
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Get product image
  const getProductImage = () => {
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const firstImage = product.images[0];
      if (typeof firstImage === "string") return firstImage;
      if (typeof firstImage === "object")
        return firstImage.url || firstImage.image_url;
    }
    if (product.image) return product.image;
    return null;
  };

  // Star rating display
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>,
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>,
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ★
          </span>,
        );
      }
    }
    return stars;
  };

  // Handle Add to Cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    }

    if (status === "loading") {
      toast.loading("Checking login status...");
      return;
    }

    if (product.quantity === 0 || product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }

    setAddingToCart(true);

    try {
      const result = await addToCart(product.id, 1);

      if (result.success) {
        toast.success("Added to cart!", {
          duration: 2000,
          position: "bottom-right",
        });
        await refreshCart();
      } else {
        if (result.error === "login_required") {
          setShowLoginModal(true);
        } else {
          toast.error(result.error || "Failed to add to cart");
        }
      }
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle Buy Now - Add to cart and go to checkout
  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    }

    if (status === "loading") {
      toast.loading("Checking login status...");
      return;
    }

    if (product.quantity === 0 || product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }

    setBuyingNow(true);
    setAddingToCart(true);

    try {
      const result = await addToCart(product.id, 1);

      if (result.success) {
        await refreshCart();
        window.location.href = "/checkout";
      } else {
        if (result.error === "login_required") {
          setShowLoginModal(true);
        } else {
          toast.error(result.error || "Failed to add to cart");
        }
      }
    } catch (error) {
      toast.error("Failed to process buy now. Please try again.");
    } finally {
      setBuyingNow(false);
      setAddingToCart(false);
    }
  };

  // Handle Login
  const handleLogin = () => {
    signIn("google", {
      callbackUrl: `/product/${product.id}`,
    });
    setShowLoginModal(false);
  };

  const productImage = getProductImage();

  return (
    <>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-8 transform transition-all duration-300 scale-100">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-blue-600">🔒</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Login Required
              </h2>

              <p className="text-gray-600 mb-8 text-lg">
                Login to add{" "}
                <strong className="text-blue-600">{product.name}</strong> to
                your cart and continue shopping.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Login with Google
                </button>

                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full text-gray-600 hover:text-gray-800 font-medium py-3.5 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {(savingsPercentage > 0 || product.discount > 0) && (
            <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow">
              -{product.discount || savingsPercentage}%
            </div>
          )}
          {product.isNew && product.isNew === true && (
            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow">
              NEW
            </div>
          )}
          {product.isHot && product.isHot === true && (
            <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow">
              🔥 HOT
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isLiked
              ? "bg-red-50 text-red-500"
              : "bg-white/80 hover:bg-white text-gray-500 hover:text-red-500"
          } shadow hover:shadow-md`}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <span className="text-xl">{isLiked ? "❤️" : "🤍"}</span>
        </button>

        {/* Product Image */}
        <Link href={`/product/${product.id}`} className="block overflow-hidden">
          <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
            {/* Image Loading State */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Product Image */}
            {productImage && !imageError ? (
              <img
                src={productImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isHovered ? "scale-110" : "scale-100"
                } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-2">📦</div>
                  <p className="text-sm text-gray-500">Product Image</p>
                </div>
              </div>
            )}

            {/* Quick View on Hover */}
            <div
              className={`absolute inset-0 bg-black/10 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 px-6 py-2 bg-white rounded-full font-medium text-gray-800 shadow-lg hover:shadow-xl">
                Quick View
              </span>
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-5">
          {/* Category */}
          <div className="mb-2">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {product.category || product.category_name || "Uncategorized"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            <Link href={`/product/${product.id}`}>{product.name}</Link>
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {shortDescription.length > 0
              ? shortDescription
              : product.description
                ? product.description.substring(0, 50) + "..."
                : "No description available"}
          </p>

          {/* Rating and Sold Count */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars()}</div>
              <span className="text-sm text-gray-600">({reviewCount})</span>
            </div>
            {soldCount > 0 && (
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                🔥 {soldCount} sold
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                रु {Number(product.price).toLocaleString("en-IN")}
              </span>
              {(product.compare_price || product.originalPrice) &&
                (product.compare_price || product.originalPrice) >
                  product.price && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      रु{" "}
                      {Number(
                        product.compare_price || product.originalPrice,
                      ).toLocaleString("en-IN")}
                    </span>
                    {savings > 0 && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        Save रु {Number(savings).toLocaleString("en-IN")}
                      </span>
                    )}
                  </>
                )}
            </div>
          </div>

          {/* Stock Indicator */}
          {(product.quantity < 20 && product.quantity > 0) ||
            (product.stock < 20 && product.stock > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>
                    Only {product.quantity || product.stock} left in stock
                  </span>
                  <span>🔥 Selling fast!</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${((product.quantity || product.stock) / 20) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}

          {/* Stock Status */}
          {(product.quantity === 0 || product.stock === 0) && (
            <div className="mb-4">
              <div className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-center">
                ⛔ Out of Stock
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={
                product.quantity === 0 || product.stock === 0 || addingToCart
              }
              className={`px-4 py-2.5 font-medium rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-1 ${
                product.quantity === 0 || product.stock === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : addingToCart
                    ? "bg-blue-600 text-white opacity-80 cursor-wait"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              }`}
            >
              {addingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Adding...</span>
                </>
              ) : (
                <>
                  <span>🛒</span>
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={
                product.quantity === 0 || product.stock === 0 || buyingNow
              }
              className={`px-4 py-2.5 font-medium rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-1 ${
                product.quantity === 0 || product.stock === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : buyingNow
                    ? "bg-gray-900 text-white opacity-80 cursor-wait"
                    : "bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white"
              }`}
            >
              {buyingNow ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Buying...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Buy Now</span>
                </>
              )}
            </button>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {product.tags.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    +{product.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
