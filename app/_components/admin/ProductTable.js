// app/_components/admin/ProductTable.js - UPDATED with main image
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  deleteProduct,
  toggleProductStatus,
} from "@/app/_lib/actions/product-actions";
import Image from "next/image";

export default function ProductTable({ products }) {
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        alert("Product deleted successfully!");
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      const result = await toggleProductStatus(id, currentStatus);
      if (result.success) {
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setTogglingId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price || 0);
  };

  const getStatusColor = (status) => {
    return status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const getStockColor = (quantity) => {
    if (quantity === 0) return "bg-red-100 text-red-800";
    if (quantity < 10) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  // Function to get the main product image
  const getMainImage = (product) => {
    // Check for images array first
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    // Fallback to image_url field if exists
    if (product.image_url) {
      return product.image_url;
    }

    // Return null if no image
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No products found. Create your first product!
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const mainImage = getMainImage(product);

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {/* Product Image */}
                        <div className="flex-shrink-0 h-12 w-12 mr-4">
                          {mainImage ? (
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={mainImage}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // If image fails to load, show fallback
                                  e.target.style.display = "none";
                                  e.target.parentElement.innerHTML = `
                                    <div class="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
                                      <span class="text-gray-400">📦</span>
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-lg">📦</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku || "N/A"}
                          </div>
                          {/* Show image count if available */}
                          {product.images && product.images.length > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              {product.images.length} image
                              {product.images.length !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {product.category_name || "Uncategorized"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                      {product.compare_price &&
                        product.compare_price > product.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(product.compare_price)}
                          </div>
                        )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockColor(
                          product.quantity,
                        )}`}
                      >
                        {product.quantity || 0} units
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            product.is_published,
                          )}`}
                        >
                          {product.is_published ? "Published" : "Draft"}
                        </span>

                        {/* Additional badges */}
                        {product.is_featured && (
                          <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                        {product.is_new && (
                          <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                        {product.is_hot && (
                          <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Hot
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                product.id,
                                product.is_published,
                              )
                            }
                            disabled={togglingId === product.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 text-sm"
                          >
                            {togglingId === product.id
                              ? "..."
                              : product.is_published
                                ? "Unpublish"
                                : "Publish"}
                          </button>

                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 text-sm"
                          >
                            {deletingId === product.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>

                        {/* Quick View Link */}
                        <Link
                          href={`/products/${product.slug || product.id}`}
                          target="_blank"
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          View on site →
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
