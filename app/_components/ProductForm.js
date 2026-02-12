// components/ProductForm.js
"use client";

import { addToCart } from "@/app/_lib/actions/cart-actions";
import { useState } from "react";
import { useCart } from "@/app/_context/CartContext";

export default function ProductForm({ productId }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { refreshCart } = useCart();

  async function handleAddToCart() {
    setLoading(true);
    setMessage("");

    try {
      const result = await addToCart(productId, quantity);

      if (result.success) {
        setMessage("✅ Added to cart!");
        setQuantity(1);
        // Refresh cart with CartContext
        await refreshCart();
      } else {
        if (result.error === "login_required") {
          setMessage("❌ Please login to add items to cart");
        } else {
          setMessage(`❌ ${result.error || "Failed to add to cart"}`);
        }
      }
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="font-medium">Quantity:</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-20 border border-gray-300 rounded px-3 py-1"
        />
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>

      {message && (
        <p
          className={`p-2 rounded ${message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
