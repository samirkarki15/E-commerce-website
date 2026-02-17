// app/admin/products/new/page.js - UPDATED VERSION
"use client";

import { createProductWithImages } from "@/app/_lib/actions/product-actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    if (session && session.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];
    const newFiles = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);
        newFiles.push(file);
      }
    });

    // Limit to 5 images
    const updatedPreviews = [...imagePreviews, ...newPreviews].slice(0, 5);
    const updatedFiles = [...imageFiles, ...newFiles].slice(0, 5);

    setImagePreviews(updatedPreviews);
    setImageFiles(updatedFiles);
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    const newFiles = [...imageFiles];

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index]);

    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);

    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
  };

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not admin
  if (!session || session.user?.role !== "admin") {
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.target);

      // Add image files to formData
      imageFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });

      const result = await createProductWithImages(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Success - redirect to products list
      alert("Product created successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-gray-600 mt-2">
          Fill in the details below to add a new product
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name *
              </label>
              <input
                name="name"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Slug (URL)
              </label>
              <input
                name="slug"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="auto-generated-from-name"
              />
            </div>
          </div>
        </div>

        {/* Product Images - UPDATED */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Images (Max 5)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                disabled={imageFiles.length >= 5}
              />
              <p className="text-sm text-gray-500 mt-1">
                First image will be used as the main product image
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onLoad={() => URL.revokeObjectURL(preview)}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price (रु) *
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="2999.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Compare Price (रु)
              </label>
              <input
                name="compare_price"
                type="number"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="3999.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cost Price (रु)
              </label>
              <input
                name="cost_price"
                type="number"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="1500.00"
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                SKU (Stock Keeping Unit)
              </label>
              <input
                name="sku"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="PROD-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quantity in Stock *
              </label>
              <input
                name="quantity"
                type="number"
                required
                min="0"
                defaultValue="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Short Description
              </label>
              <textarea
                name="short_description"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Brief description (shown in listings)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Full Description
              </label>
              <textarea
                name="description"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Detailed product description..."
              />
            </div>
          </div>
        </div>

        {/* Organization - UPDATED: Category as text input */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Organization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <input
                name="category_name"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="e.g., Electronics, Fashion, Home & Living"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter category name manually
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <input
                name="brand"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Brand name"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Tags (comma separated)
            </label>
            <input
              name="tags"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        {/* Status & Visibility */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Status & Visibility</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                id="is_published"
                defaultChecked
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_published" className="ml-2">
                Publish product (visible to customers)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                id="is_featured"
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_featured" className="ml-2">
                Feature this product
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_hot"
                id="is_hot"
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_hot" className="ml-2">
                Mark as Hot Product
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_new"
                id="is_new"
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_new" className="ml-2">
                Mark as New Arrival
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Product...
              </>
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
