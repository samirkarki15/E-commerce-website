// app/admin/reviews/page.js - UPDATED VERSION
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  getAllReviewsForAdmin,
  getAdminReviewStats,
  deleteReviewAsAdmin,
} from "@/app/_lib/actions/review-actions";

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [productId, setProductId] = useState("");
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Check if user is admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/reviews");
    }
  }, [status, router]);

  // Load reviews and stats
  useEffect(() => {
    if (status === "authenticated") {
      loadReviews();
      loadStats();
    }
  }, [status, page, productId]);

  async function loadReviews() {
    try {
      setLoading(true);
      console.log("Loading reviews for admin...");

      const result = await getAllReviewsForAdmin({
        productId: productId || null,
        page,
        limit,
        search: searchTerm,
      });

      console.log("Reviews loaded:", result.reviews?.length || 0);

      if (result.error) {
        toast.error(result.error);
        setReviews([]);
      } else {
        setReviews(result.reviews || []);
        setTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      console.log("Loading review stats...");
      const result = await getAdminReviewStats();

      if (result.error) {
        console.error("Error loading stats:", result.error);
      } else {
        setStats(result);
        console.log("Stats loaded:", result);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  // In app/admin/reviews/page.js, update the handleDeleteReview function:

  async function handleDeleteReview(reviewId) {
    if (
      !confirm(
        "Are you sure you want to delete this review? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      // Use the admin delete function
      const result = await deleteReviewAsAdmin(reviewId);

      if (result.success) {
        toast.success("Review deleted successfully");
        // Remove from local state
        setReviews(reviews.filter((review) => review.id !== reviewId));
        // Reload stats
        loadStats();
      } else {
        toast.error(result.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Error deleting review");
    }
  }

  // Search handler with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        loadReviews();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Customer Reviews
              </h1>
              <p className="text-gray-600 mt-2">
                View and manage customer reviews ({stats.totalReviews} total)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Dashboard
              </Link>
              <button
                onClick={loadReviews}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalReviews}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.averageRating.toFixed(1)}/5.0
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">5-Star Reviews</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.ratingDistribution[5]}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Unique Products</p>
              <p className="text-2xl font-bold text-green-600">
                {new Set(reviews.map((r) => r.product_id)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reviews by product, user, or comment..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>

            {/* Product Filter */}
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Filter by Product ID"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
            </div>
          </div>

          {/* Rating Distribution */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Rating Distribution
            </h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating];
                const percentage =
                  stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="w-16 text-right">
                      <span className="text-sm font-medium text-gray-600">
                        {rating} Star{rating !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-yellow-400 h-3 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-left">
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-600">
                {searchTerm || productId
                  ? "No reviews match your search criteria"
                  : "No reviews in the system yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating & Review
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        {/* Product */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex-shrink-0">
                              {review.product?.images?.[0] ? (
                                <img
                                  src={review.product.images[0]}
                                  alt={review.product.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                  📦
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {review.product?.name || "Unknown Product"}
                              </div>
                              <Link
                                href={`/product/${review.product_id}`}
                                target="_blank"
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                View Product →
                              </Link>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 flex-shrink-0">
                              {review.user?.image ? (
                                <img
                                  src={review.user.image}
                                  alt={review.user.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {review.user?.name?.charAt(0) || "C"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {review.user?.name || "Anonymous Customer"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {review.user?.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Rating & Review */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className="flex text-yellow-400 text-lg">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i}>
                                    {i < review.rating ? "★" : "☆"}
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 mt-1">
                                {review.rating}/5
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {review.comment || "No comment provided"}
                              </p>
                              {!review.comment && (
                                <span className="text-xs text-gray-400 italic">
                                  Rating only, no comment
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            ⚠️ Review Management Guidelines
          </h3>
          <ul className="space-y-2 text-yellow-800">
            <li className="flex items-start gap-2">
              <span className="font-medium">•</span>
              <span>
                <strong>Reviews are auto-approved</strong> after purchase
                verification
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">•</span>
              <span>
                <strong>Only delete reviews</strong> that violate terms (spam,
                offensive content, fake reviews)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">•</span>
              <span>
                <strong>Customer feedback is valuable</strong> - think twice
                before deleting
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
