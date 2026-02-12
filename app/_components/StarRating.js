// components/StarRating.js - FIXED VERSION
"use client";

import { useState } from "react";

export default function StarRating({
  rating = 0,
  onRatingChange,
  size = "lg",
  readOnly = false,
  showLabel = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
    xl: "text-5xl",
  };

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const getStarIcon = (index) => {
    const displayRating = hoverRating || rating;
    const starValue = index + 1;

    if (starValue <= displayRating) {
      return "★"; // Filled star
    } else if (starValue - 0.5 <= displayRating) {
      return "½"; // Half star
    } else {
      return "☆"; // Empty star
    }
  };

  const getStarColor = (index) => {
    const displayRating = hoverRating || rating;
    const starValue = index + 1;

    if (starValue <= displayRating) {
      return "text-yellow-400";
    } else if (starValue - 0.5 <= displayRating) {
      return "text-yellow-400";
    } else {
      return "text-gray-300";
    }
  };

  const getLabel = () => {
    if (rating === 0) return "No rating";
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4) return "Very Good";
    if (rating >= 3) return "Good";
    if (rating >= 2) return "Fair";
    return "Poor";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        {[0, 1, 2, 3, 4].map((index) => {
          const starValue = index + 1;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={readOnly}
              className={`${sizes[size]} transition-transform duration-200 ${
                !readOnly
                  ? "hover:scale-125 active:scale-95 cursor-pointer"
                  : "cursor-default"
              } ${
                hoverRating >= starValue ? "transform scale-110" : ""
              } ${getStarColor(index)}`}
              aria-label={`Rate ${starValue} out of 5 stars`}
            >
              {getStarIcon(index)}
            </button>
          );
        })}
      </div>

      {showLabel && (
        <div className="mt-2 text-center">
          <span className="text-lg font-semibold text-gray-900">
            {rating.toFixed(1)}
          </span>
          <span className="text-gray-600 ml-2">•</span>
          <span className="text-gray-600 ml-2">{getLabel()}</span>
        </div>
      )}
    </div>
  );
}
