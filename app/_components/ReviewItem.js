"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { deleteUserReview } from "@/app/_lib/actions/review-actions";
import StarRating from "./StarRating";
import toast from "react-hot-toast";

export default function ReviewItem({ review, onReviewUpdated }) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCurrentUser = session?.user?.id === review.user_id;
  const user = review.user || {};
  const reviewDate = new Date(review.created_at);
  const formattedDate = reviewDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUserReview(review.id, session.user.id);

      if (result.success) {
        toast.success("Review deleted successfully");
        if (onReviewUpdated) {
          onReviewUpdated();
        }
      } else {
        toast.error(result.error || "Failed to delete review");
      }
    } catch (error) {
      toast.error("Failed to delete review");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-red-600">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Delete Review?
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your review? This action cannot
                be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Card */}
      <div className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200">
        {/* Review Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-blue-600">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* User Info */}
            <div>
              <h4 className="font-semibold text-gray-900">
                {user.name || "Anonymous"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  <StarRating rating={review.rating} readOnly size="sm" />
                </div>
                <span className="text-gray-500 text-sm">•</span>
                <span className="text-gray-500 text-sm">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Verified Purchase Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
              <span>✓</span>
              Verified Purchase
            </span>

            {/* Action Buttons (for current user) */}
            {isCurrentUser && (
              <div className="flex items-center gap-2">
                {/* Edit Button (You can implement edit functionality) */}
                {/* <button
                  onClick={() => {}}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit review"
                >
                  ✏️
                </button> */}

                {/* Delete Button */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete review"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Review Title */}
        {review.title && (
          <h5 className="text-lg font-semibold text-gray-900 mb-3">
            {review.title}
          </h5>
        )}

        {/* Review Comment */}
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {review.comment}
          </p>
        </div>

        {/* Review Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {isCurrentUser ? "Your review" : "Helpful review"}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors text-sm">
              <span>👍</span>
              <span>Helpful</span>
            </button>
            <span className="text-gray-300">•</span>
            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors text-sm">
              <span>👎</span>
              <span>Not Helpful</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
