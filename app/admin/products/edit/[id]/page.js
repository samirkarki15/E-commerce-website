"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getProductById,
  updateProduct,
} from "@/app/_lib/actions/product-actions";
import {
  uploadProductImage,
  deleteProductImage,
} from "@/app/_lib/actions/image-actions";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");

  // Image state
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Step 1: Check authentication
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setAuthError("Please sign in to access this page");
      router.push("/auth/signin");
      return;
    }

    if (session && session.user?.role !== "admin") {
      setAuthError("You don't have permission to edit products");
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Step 2: Load product only if authenticated as admin
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") {
      return;
    }

    loadProduct();
  }, [params.id, status, session]);

  async function loadProduct() {
    try {
      setLoading(true);
      setError("");

      const result = await getProductById(params.id);

      if (result.error || !result.product) {
        setError(result.error || "Product not found");
        return;
      }

      setProduct(result.product);

      // Initialize existing images from product
      const productImages = result.product.images || [];
      setExistingImages(productImages);
    } catch (err) {
      setError("Failed to load product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle new image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];
    const newFiles = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);
        newFiles.push(file);
      }
    });

    // Calculate total images (existing + new)
    const totalImages =
      existingImages.length + newImageFiles.length + newFiles.length;
    if (totalImages > 5) {
      alert(
        `You can only have up to 5 images total. You currently have ${existingImages.length} existing images.`,
      );
      return;
    }

    setImagePreviews([...imagePreviews, ...newPreviews]);
    setNewImageFiles([...newImageFiles, ...newFiles]);
  };

  // Remove new image (not uploaded yet)
  const removeNewImage = (index) => {
    const newPreviews = [...imagePreviews];
    const newFiles = [...newImageFiles];

    URL.revokeObjectURL(newPreviews[index]);

    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);

    setImagePreviews(newPreviews);
    setNewImageFiles(newFiles);
  };

  // Mark existing image for deletion
  const markImageForDeletion = (imageUrl, index) => {
    if (!imagesToDelete.includes(imageUrl)) {
      setImagesToDelete([...imagesToDelete, imageUrl]);

      // Add visual indication - we'll use a CSS class instead of removing from array
      // Keep in array but mark as to be deleted
    }
  };

  // Restore image marked for deletion
  const restoreImage = (imageUrl) => {
    setImagesToDelete(imagesToDelete.filter((img) => img !== imageUrl));
  };

  // Upload new images to Supabase
  const uploadImages = async (productId) => {
    const uploadedImageUrls = [];

    for (let i = 0; i < newImageFiles.length; i++) {
      const file = newImageFiles[i];
      try {
        const uploadResult = await uploadProductImage(
          productId,
          file,
          i === 0 && existingImages.length === 0, // Set as primary if no existing images
        );

        if (uploadResult.success) {
          const imageUrl = uploadResult.publicUrl || uploadResult.url;
          if (imageUrl) {
            uploadedImageUrls.push(imageUrl);
          }
        } else {
          console.error("Failed to upload image:", uploadResult.error);
        }
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
      }
    }

    return uploadedImageUrls;
  };

  // Delete images from Supabase
  const deleteImagesFromStorage = async () => {
    for (const imageUrl of imagesToDelete) {
      try {
        // Extract file path from URL
        const urlParts = imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${product.id}/${fileName}`;

        const deleteResult = await deleteProductImage(filePath);
        if (!deleteResult.success) {
          console.error("Failed to delete image:", deleteResult.error);
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setUploadingImages(true);

    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      // 1. Upload new images first
      let newImageUrls = [];
      if (newImageFiles.length > 0) {
        newImageUrls = await uploadImages(product.id);
      }

      // 2. Delete marked images from storage
      if (imagesToDelete.length > 0) {
        await deleteImagesFromStorage();
      }

      // 3. Prepare updated images array
      const remainingImages = existingImages.filter(
        (img) => !imagesToDelete.includes(img),
      );
      const allImages = [...remainingImages, ...newImageUrls];

      // Convert form data to proper types
      const productData = {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        description: data.description || "",
        short_description: data.short_description || "",
        price: parseFloat(data.price) || 0,
        compare_price: data.compare_price
          ? parseFloat(data.compare_price)
          : null,
        cost_price: data.cost_price ? parseFloat(data.cost_price) : null,
        sku: data.sku || "",
        quantity: parseInt(data.quantity) || 0,
        category_name: data.category || "",
        brand: data.brand || "",
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
        is_featured: data.is_featured === "on",
        is_published: data.is_published === "on",
        is_hot: data.is_hot === "on",
        is_new: data.is_new === "on",
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        images: allImages.length > 0 ? allImages : [],
      };

      // 4. Update product with new images array
      const result = await updateProduct(params.id, productData);

      if (result.success) {
        // Clean up object URLs
        imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));

        router.push("/admin/products");
        router.refresh();
      } else {
        setError(result.error || "Failed to update product");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      console.error(err);
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  }

  function generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading skeleton while loading product data
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Back Button Skeleton */}
        <div className="mb-6">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>

        {/* Form Skeleton */}
        <div className="space-y-6">
          {/* Product Images Section Skeleton */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Basic Information Skeleton */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Pricing & Inventory Skeleton */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Authentication error
  if (authError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-red-800 font-bold">Access Denied</h2>
          <p className="text-red-600 mt-2">{authError}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Not authorized
  if (session?.user?.role !== "admin") {
    return null;
  }

  // Product not found
  if (!product) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-red-800 font-bold">Product Not Found</h2>
          <p className="text-red-600">
            {error || "The product does not exist."}
          </p>
          <button
            onClick={() => router.push("/admin/products")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/products")}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Back to Products
        </button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-gray-600 mt-2">Editing: {product.name}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Images Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>

          <div className="space-y-4">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {existingImages.map((imageUrl, index) => {
                    const isMarkedForDelete = imagesToDelete.includes(imageUrl);
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Product image ${index + 1}`}
                          className={`w-full h-32 object-cover rounded-lg ${
                            isMarkedForDelete ? "opacity-50" : ""
                          }`}
                        />
                        {index === 0 && !isMarkedForDelete && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            isMarkedForDelete
                              ? restoreImage(imageUrl)
                              : markImageForDeletion(imageUrl, index)
                          }
                          className={`absolute top-2 right-2 text-white rounded-full p-1 ${
                            isMarkedForDelete
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          {isMarkedForDelete ? "↺" : "✕"}
                        </button>
                        {isMarkedForDelete && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                              To be deleted
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Add New Images (Max{" "}
                {5 - existingImages.length + imagesToDelete.length} more)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                disabled={
                  existingImages.length +
                    newImageFiles.length -
                    imagesToDelete.length >=
                  5
                }
              />
              <p className="text-sm text-gray-500 mt-1">
                You can have up to 5 images total. First image will be used as
                the main product image.
              </p>
            </div>

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">
                  New Images to Upload
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onLoad={() => URL.revokeObjectURL(preview)}
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Image Summary:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Existing images: {existingImages.length}</li>
                <li>• Marked for deletion: {imagesToDelete.length}</li>
                <li>• New images to upload: {newImageFiles.length}</li>
                <li>
                  • Total after save:{" "}
                  {existingImages.length -
                    imagesToDelete.length +
                    newImageFiles.length}{" "}
                  / 5
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name *
              </label>
              <input
                name="name"
                defaultValue={product.name}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <input
                name="slug"
                defaultValue={product.slug}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                SKU (Stock Keeping Unit)
              </label>
              <input
                name="sku"
                defaultValue={product.sku}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Short Description
              </label>
              <textarea
                name="short_description"
                defaultValue={product.short_description}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Full Description
              </label>
              <textarea
                name="description"
                defaultValue={product.description}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price ($) *
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product.price}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Compare Price ($)
              </label>
              <input
                name="compare_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product.compare_price || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cost Price ($)
              </label>
              <input
                name="cost_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product.cost_price || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quantity in Stock *
              </label>
              <input
                name="quantity"
                type="number"
                min="0"
                defaultValue={product.quantity}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <input
                name="brand"
                defaultValue={product.brand || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                name="category"
                defaultValue={product.category_name || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="e.g., Electronics, Fashion"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Tags (comma separated)
            </label>
            <input
              name="tags"
              defaultValue={product.tags?.join(", ") || ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="e.g., wireless, bluetooth, premium"
            />
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Title
              </label>
              <input
                name="meta_title"
                defaultValue={product.meta_title || ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Description
              </label>
              <textarea
                name="meta_description"
                defaultValue={product.meta_description || ""}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        {/* Status Flags */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Product Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                id="is_published"
                defaultChecked={product.is_published}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_published" className="ml-2">
                Published (visible to customers)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                id="is_featured"
                defaultChecked={product.is_featured}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_featured" className="ml-2">
                Featured Product
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_hot"
                id="is_hot"
                defaultChecked={product.is_hot}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_hot" className="ml-2">
                Hot Product
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_new"
                id="is_new"
                defaultChecked={product.is_new}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="is_new" className="ml-2">
                New Product
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {uploadingImages ? "Uploading Images..." : "Saving..."}
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
