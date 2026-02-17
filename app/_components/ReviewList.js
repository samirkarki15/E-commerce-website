"use client";

import { useState, useEffect } from "react";
import { getProductReviews } from "@/app/_lib/actions/review-actions";
import ReviewItem from "./ReviewItem";

export default function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const limit = 5;

  const fetchReviews = async (pageNum = 1, sort = "newest") => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getProductReviews(productId, {
        page: pageNum,
        limit: limit,
        sortBy: sort,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setReviews(result.reviews || []);
        setTotalReviews(result.total || 0);
        setTotalPages(result.totalPages || 1);
      }
    } catch (err) {
      setError("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reviews when productId changes
  useEffect(() => {
    setPage(1);
    fetchReviews(1, sortBy);
  }, [productId]);

  // Fetch reviews when sortBy changes
  useEffect(() => {
    setPage(1);
    fetchReviews(1, sortBy);
  }, [sortBy]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchReviews(newPage, sortBy);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleReviewUpdated = () => {
    fetchReviews(page, sortBy);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">😕</div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Reviews
          </h4>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchReviews(page, sortBy)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Customer Reviews ({totalReviews})
        </h3>

        {totalReviews > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {totalReviews === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-6">⭐</div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            No Reviews Yet
          </h4>
          <p className="text-gray-600 mb-6">
            Be the first to share your experience with this product!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                onReviewUpdated={handleReviewUpdated}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {Math.min((page - 1) * limit + 1, totalReviews)}-
                {Math.min(page * limit, totalReviews)} of {totalReviews} reviews
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    page === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (page <= 3) {
                      pageNum = idx + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = page - 2 + idx;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                          page === pageNum
                            ? "bg-blue-600 text-white font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && page < totalPages - 2 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="w-10 h-10 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    page === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
