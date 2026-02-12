"use client";

import StarRating from "./StarRating";

export default function ReviewStatistics({ statistics }) {
  const {
    averageRating = 0,
    totalReviews = 0,
    ratingDistribution = {},
  } = statistics;

  const calculatePercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const renderRatingBar = (stars, count) => {
    const percentage = calculatePercentage(count);

    return (
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center w-24">
          <span className="text-gray-600 w-6 text-center">{stars}</span>
          <span className="ml-2">⭐</span>
        </div>
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <div className="w-16 text-right">
          <span className="text-sm font-medium text-gray-700">
            {percentage}%
          </span>
          <span className="text-xs text-gray-500 ml-1">({count})</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Customer Reviews
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Average Rating */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="mb-3">
              <StarRating rating={averageRating} readOnly size="lg" />
            </div>
            <div className="text-gray-600">
              {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2">
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars}>
                {renderRatingBar(stars, ratingDistribution[stars] || 0)}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="flex items-center gap-2 mb-1">
                <span className="text-green-500">✓</span>
                <span>Only verified purchasers can write reviews</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-500">✓</span>
                <span>All reviews are checked by our team</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
