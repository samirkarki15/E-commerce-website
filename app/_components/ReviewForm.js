"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import StarRating from "./StarRating";
import toast from "react-hot-toast";
import { submitReview } from "@/app/_lib/actions/review-actions";

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status === "unauthenticated") {
      setShowLoginModal(true);
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }

    // Check word count (max 200 words)
    const wordCount = comment.trim().split(/\s+/).length;
    if (wordCount > 200) {
      toast.error("Review cannot exceed 200 words");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReview(
        {
          product_id: productId,
          rating: rating,
          comment: comment.trim(),
        },
        session.user.id,
      );

      if (result.success) {
        toast.success("Review submitted successfully!");
        setRating(0);
        setComment("");
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        if (result.error.includes("already reviewed")) {
          toast.error("You have already reviewed this product.");
        } else if (result.error.includes("purchase")) {
          toast.error(
            "You need to purchase this product before writing a review.",
          );
        } else {
          toast.error(result.error || "Failed to submit review");
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    signIn("google", {
      callbackUrl: window.location.pathname,
    });
    setShowLoginModal(false);
  };

  const wordCount = comment
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return (
    <>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-8">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
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
              <p className="text-gray-600 mb-6">
                Please login to write a review for this product.
              </p>
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200"
              >
                Login with Google
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h3>

        {status === "unauthenticated" ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🔒</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Login to Write a Review
            </h4>
            <p className="text-gray-600 mb-6">
              Please login to share your experience with this product.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              Login Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">
                Your Rating *
              </label>
              <div className="flex flex-col items-center">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="xl"
                />
                <div className="mt-3 flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {rating === 0
                      ? "Select your rating"
                      : `${rating}.0 out of 5`}
                  </span>
                  {rating > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {rating === 5
                        ? "Excellent"
                        : rating === 4
                          ? "Very Good"
                          : rating === 3
                            ? "Good"
                            : rating === 2
                              ? "Fair"
                              : "Poor"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-none"
                required
              />
              <div className="flex justify-between mt-1">
                <div className="text-sm text-gray-500">
                  Minimum 10 characters
                </div>
                <div
                  className={`text-sm ${wordCount > 200 ? "text-red-500" : "text-gray-500"}`}
                >
                  {wordCount}/200 words
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  rating === 0 ||
                  comment.length < 10 ||
                  wordCount > 200
                }
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  !isSubmitting &&
                  rating > 0 &&
                  comment.length >= 10 &&
                  wordCount <= 200
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Review...
                  </div>
                ) : (
                  "Submit Review"
                )}
              </button>
              <p className="text-center text-gray-500 text-sm mt-3">
                Your review will be visible immediately to other customers.
              </p>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
