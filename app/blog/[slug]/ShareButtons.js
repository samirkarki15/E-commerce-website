// app/blog/[slug]/ShareButtons.js
"use client";

import { useState } from "react";

export default function ShareButtons({ title, excerpt }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt,
          url: window.location.href,
        });
      } catch (error) {
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        📤 Share
      </button>
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {copied ? "✅ Copied!" : "🔗 Copy Link"}
      </button>
    </div>
  );
}
