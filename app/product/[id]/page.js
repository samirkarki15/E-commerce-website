// app/product/[id]/page.js - FIXED
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  getProductDetail,
  getRelatedProducts,
} from "@/app/_lib/actions/product-detail-actions";
import ProductCard from "@/app/_components/ProductCard";
import { addToCart } from "@/app/_lib/actions/cart-actions";
import { useCart } from "@/app/_context/CartContext";
import toast from "react-hot-toast";

// Import review components and actions
import ReviewStatistics from "@/app/_components/ReviewStatistics";
import ReviewEligibility from "@/app/_components/ReviewEligibility";
import ReviewList from "@/app/_components/ReviewList";
import { getReviewStatistics } from "@/app/_lib/actions/review-actions";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const { data: session, status } = useSession();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Add review-related state
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviewDataLoaded, setReviewDataLoaded] = useState(false);

  // Function to fetch review data
  const fetchReviewData = async () => {
    if (!product || !product.id) return;

    try {
      // Get review statistics
      const statsResult = await getReviewStatistics(product.id);
      if (!statsResult.error) {
        setReviewStats({
          averageRating: statsResult.averageRating,
          totalReviews: statsResult.totalReviews,
          ratingDistribution: statsResult.ratingDistribution,
        });
      }
    } catch (error) {
    } finally {
      setReviewDataLoaded(true);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      setReviewDataLoaded(false);

      try {
        const { product: productData, error: productError } =
          await getProductDetail(productId);

        if (productError || !productData) {
          setError(productError || "Product not found");
          return;
        }

        setProduct(productData);

        // ✅ FIX: Fetch review data using productData directly, not product state
        try {
          const statsResult = await getReviewStatistics(productData.id);
          if (!statsResult.error) {
            setReviewStats({
              averageRating: statsResult.averageRating,
              totalReviews: statsResult.totalReviews,
              ratingDistribution: statsResult.ratingDistribution,
            });
          }
        } catch (error) {
        } finally {
          setReviewDataLoaded(true);
        }

        // Fetch related products
        if (productData.category) {
          const related = await getRelatedProducts(
            productData.category,
            productData.id,
            4,
          );
          setRelatedProducts(related);
        }
      } catch (err) {
        setError("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    }

    if (status === "loading") {
      toast.loading("Checking login status...");
      return;
    }

    if (product.quantity === 0) {
      toast.error("This product is out of stock");
      return;
    }

    setAddingToCart(true);

    try {
      const result = await addToCart(product.id, quantity);

      if (result.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <span>🛒</span>
            <span>Added to cart!</span>
            <Link
              href="/cart"
              className="text-blue-500 hover:text-blue-600 underline text-sm ml-2"
            >
              View Cart
            </Link>
          </div>,
          {
            duration: 3000,
            position: "bottom-right",
          },
        );
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

  const handleShare = async () => {
    if (!product) return;

    const shareUrl = window.location.href;
    const shareText = `Check out ${product.name} - रु${product.price}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (error) {}
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link. Please copy manually.");
      }
    }
  };

  const handleLogin = () => {
    signIn("google", {
      callbackUrl: window.location.pathname,
    });
    setShowLoginModal(false);
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    }

    if (product.quantity === 0) {
      toast.error("This product is out of stock");
      return;
    }

    setAddingToCart(true);

    try {
      const result = await addToCart(product.id, quantity);

      if (result.success) {
        await refreshCart();
        window.location.href = "/checkout";
      } else {
        if (result.error === "login_required") {
          setShowLoginModal(true);
        } else {
          toast.error(result.error || "Failed to proceed to checkout");
        }
      }
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmitted = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    window.location.reload(true);
  };

  // Update the rating display in the product header
  // FIXED: Use 0 if no reviews, not product rating
  const displayRating =
    reviewStats.totalReviews > 0 ? reviewStats.averageRating : 0;
  const displayReviewCount = reviewStats.totalReviews || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Product
          </h3>
          <p className="text-gray-600">Product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md px-4">
          <div className="text-7xl mb-6">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-y-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="block text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const imageArray = Array.isArray(product.images) ? product.images : [];
  const currentImage =
    imageArray.length > 0 && imageArray[selectedImage]
      ? imageArray[selectedImage]
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random&size=400`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
                your cart and save it for later.
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

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">✨ Benefits:</span> Save cart
                  across devices, track orders, and get personalized
                  recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-3 text-sm">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Home
            </Link>
            <span className="text-gray-400">›</span>
            <Link
              href="/shop"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Shop
            </Link>
            <span className="text-gray-400">›</span>
            <Link
              href={`/shop?category=${product.category}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {product.category}
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-semibold truncate max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Login Status Bar */}
      {status === "unauthenticated" && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-yellow-600">🔒</span>
                </div>
                <div>
                  <p className="text-yellow-800 font-medium">
                    Login to save your cart and checkout faster
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Your cart will be saved automatically after login
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* LEFT SIDE - IMAGES */}
          <div className="space-y-6">
            {/* Main Image Display */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-xl aspect-square group">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random&size=400`;
                }}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.discount > 0 && (
                  <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                    -{product.discount}% OFF
                  </div>
                )}
                {product.isNew && (
                  <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-full shadow-lg">
                    🎉 NEW ARRIVAL
                  </div>
                )}
                {product.isHot && (
                  <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                    🔥 HOT SELLER
                  </div>
                )}
              </div>

              {/* Stock Status Badge */}
              <div className="absolute top-4 right-4">
                {product.quantity > 10 ? (
                  <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-full shadow-lg">
                    ✅ IN STOCK
                  </div>
                ) : product.quantity > 0 ? (
                  <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full shadow-lg animate-pulse">
                    ⚠️ ONLY {product.quantity} LEFT
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-bold rounded-full shadow-lg">
                    ⛔ OUT OF STOCK
                  </div>
                )}
              </div>

              {/* Image Navigation */}
              {imageArray.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        selectedImage === 0
                          ? imageArray.length - 1
                          : selectedImage - 1,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all opacity-0 group-hover:opacity-100 text-xl font-bold hover:scale-110"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        selectedImage === imageArray.length - 1
                          ? 0
                          : selectedImage + 1,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all opacity-0 group-hover:opacity-100 text-xl font-bold hover:scale-110"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Zoom Button */}
              <button className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110">
                🔍
              </button>
            </div>

            {/* Image Thumbnails */}
            {imageArray.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imageArray.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-105 ${
                      selectedImage === idx
                        ? "border-blue-600 ring-3 ring-blue-300 shadow-lg"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random&size=100`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                <div className="text-2xl mb-2">🚚</div>
                <p className="text-sm font-medium text-gray-900">
                  Free Shipping
                </p>
                <p className="text-xs text-gray-500">On orders over रु5000</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                <div className="text-2xl mb-2">↩️</div>
                <p className="text-sm font-medium text-gray-900">
                  Easy Returns
                </p>
                <p className="text-xs text-gray-500">30-day return policy</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-sm font-medium text-gray-900">
                  Secure Payment
                </p>
                <p className="text-xs text-gray-500">100% secure checkout</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                <div className="text-2xl mb-2">📞</div>
                <p className="text-sm font-medium text-gray-900">
                  24/7 Support
                </p>
                <p className="text-xs text-gray-500">Customer service</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - DETAILS */}
          <div className="space-y-8">
            {/* Title & Basic Info */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400 text-lg">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {displayReviewCount === 0
                          ? "☆"
                          : i < Math.floor(displayRating)
                            ? "⭐"
                            : i < displayRating
                              ? "🌟"
                              : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="ml-3 text-gray-700 font-medium">
                    {displayRating.toFixed(1)}/5.0
                  </span>
                  <span className="ml-2 text-gray-500">
                    ({displayReviewCount} review
                    {displayReviewCount !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="text-gray-600">
                  <span className="font-medium">{product.soldCount || 0}</span>{" "}
                  sold
                </div>
                {product.brand && (
                  <>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {product.brand}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl md:text-5xl font-bold text-gray-900">
                  रु {Number(product.price).toLocaleString("en-IN")}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      रु {Number(product.originalPrice).toLocaleString("en-IN")}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-full">
                      Save रु{" "}
                      {Number(
                        product.originalPrice - product.price,
                      ).toLocaleString("en-IN")}
                    </span>
                  </>
                )}
              </div>
              {product.discount > 0 && (
                <p className="text-lg font-semibold text-green-600">
                  🎉 You save{" "}
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100,
                  )}
                  %!
                </p>
              )}
            </div>

            {/* Stock & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-medium mb-2">
                  STOCK STATUS
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${product.quantity > 10 ? "bg-green-500 animate-pulse" : product.quantity > 0 ? "bg-yellow-500 animate-pulse" : "bg-red-500"}`}
                  ></div>
                  <p
                    className={`font-semibold ${product.quantity > 10 ? "text-green-600" : product.quantity > 0 ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {product.quantity > 10
                      ? "In Stock"
                      : product.quantity > 0
                        ? `Low Stock (${product.quantity} left)`
                        : "Out of Stock"}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500 font-medium mb-2">SKU</p>
                <p className="font-mono text-gray-900 text-lg">
                  {product.sku || "N/A"}
                </p>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div>
                  <p className="text-gray-700 font-medium mb-3">Quantity:</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden w-fit shadow-sm">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={product.quantity === 0}
                        className="px-5 py-3 text-xl text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-20 text-center border-0 py-3 text-xl font-bold focus:outline-none"
                        min="1"
                        max={product.quantity || 10}
                        disabled={product.quantity === 0}
                      />
                      <button
                        onClick={() =>
                          setQuantity(
                            Math.min(product.quantity || 10, quantity + 1),
                          )
                        }
                        disabled={product.quantity === 0}
                        className="px-5 py-3 text-xl text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-gray-500 text-sm">
                      Max: {product.quantity || 10} units
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.quantity === 0 || addingToCart}
                    className={`py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                      product.quantity > 0 &&
                      !addingToCart &&
                      status === "authenticated"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        : product.quantity === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : status === "unauthenticated"
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                            : "bg-blue-600 text-white opacity-80 cursor-wait"
                    }`}
                  >
                    {addingToCart ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </div>
                    ) : status === "unauthenticated" ? (
                      <div className="flex items-center justify-center gap-2">
                        <span>🔒</span>
                        Login to Add to Cart
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>🛒</span>
                        Add to Cart
                      </div>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.quantity === 0 || addingToCart}
                    className={`py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                      product.quantity > 0 && !addingToCart
                        ? "bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>⚡</span>
                      Buy Now
                    </div>
                  </button>
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="w-full py-3.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>📤</span>
                  Share This Product
                </button>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <p className="text-gray-700 font-medium mb-4">Product Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:border-blue-300 transition-all duration-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="flex flex-wrap gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
            {["description", "specifications", "reviews", "shipping"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 font-semibold text-lg transition-all duration-300 capitalize ${
                    activeTab === tab
                      ? "text-blue-600 border-b-4 border-blue-600"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            {activeTab === "description" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Product Description
                </h3>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {product.description || product.shortDescription}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">Brand</span>
                      <span className="font-medium">
                        {product.brand || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">SKU</span>
                      <span className="font-medium">
                        {product.sku || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Review Statistics */}
                {reviewDataLoaded && (
                  <ReviewStatistics statistics={reviewStats} />
                )}

                {/* Review Eligibility Checker */}
                <ReviewEligibility
                  productId={product.id}
                  onReviewSubmitted={handleReviewSubmitted}
                />

                {/* Reviews List */}
                {reviewDataLoaded && <ReviewList productId={product.id} />}
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Shipping & Returns
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-lg">
                      🚚 Shipping
                    </h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-green-500">✓</span>
                        <span>Free shipping on orders over रु5000</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500">✓</span>
                        <span>Standard delivery: 3-7 business days</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500">✓</span>
                        <span>Express shipping available at checkout</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-lg">
                      ↩️ Returns
                    </h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-green-500">✓</span>
                        <span>30-day return policy</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500">✓</span>
                        <span>Free returns for defective items</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-500">✓</span>
                        <span>Full refund within 7 days of return</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                You May Also Like
              </h2>
              <Link
                href={`/shop?category=${product.category}`}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
              >
                View All
                <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
