"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { canUserReviewProduct } from "@/app/_lib/actions/review-actions";
import ReviewForm from "./ReviewForm";

export default function ReviewEligibility({ productId, onReviewSubmitted }) {
  const { data: session, status } = useSession();
  const [canReview, setCanReview] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEligibility = async () => {
      if (status === "authenticated" && session?.user?.id) {
        setLoading(true);
        try {
          const result = await canUserReviewProduct(session.user.id, productId);
          setCanReview(result.canReview);
          setReason(result.reason);
        } catch (error) {
          console.error("Error checking review eligibility:", error);
          setCanReview(false);
          setReason("error");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setCanReview(false);
        setReason("not_logged_in");
      }
    };

    checkEligibility();
  }, [status, session, productId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Checking review eligibility...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="text-center py-8">
          {reason === "not_logged_in" ? (
            <>
              <div className="text-5xl mb-4">🔒</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Login to Write a Review
              </h4>
              <p className="text-gray-600 mb-6">
                Please login to share your experience with this product.
              </p>
            </>
          ) : reason === "already_reviewed" ? (
            <>
              <div className="text-5xl mb-4">⭐</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Already Reviewed
              </h4>
              <p className="text-gray-600 mb-6">
                You have already reviewed this product.
              </p>
            </>
          ) : reason === "not_purchased" ? (
            <>
              <div className="text-5xl mb-4">🛒</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Purchase Required
              </h4>
              <p className="text-gray-600 mb-6">
                You need to purchase and receive this product before writing a
                review.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Note:</span> Only customers who
                  have purchased and received this product can write reviews.
                  Once your order is delivered and paid, you'll be able to
                  review it here.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">😕</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Cannot Write Review
              </h4>
              <p className="text-gray-600 mb-6">
                You are not currently eligible to review this product.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <ReviewForm productId={productId} onReviewSubmitted={onReviewSubmitted} />
  );
}
