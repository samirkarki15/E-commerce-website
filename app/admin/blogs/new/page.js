// app/admin/blogs/new/page.js - UPDATED WITH ADMIN CHECK
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { createBlog } from "@/app/_lib/actions/blog-actions";
import { uploadBlogImage } from "@/app/_lib/actions/blog-image-actions";
import { isAdmin } from "@/app/_lib/actions/admin-actions"; // ADD THIS IMPORT

export default function NewBlogPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false); // ADD THIS STATE

  // Check if user is admin on component mount
  useEffect(() => {
    async function checkAdmin() {
      try {
        const adminCheck = await isAdmin();
        setIsAdminUser(adminCheck);

        if (!adminCheck) {
          // Redirect non-admin users immediately
          router.push("/");
          return;
        }
      } catch (error) {
        router.push("/");
      }
    }

    checkAdmin();
  }, [router]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    status: "draft",
    is_featured: false,
    featured_image: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    meta_robots: "index, follow",
    canonical_url: "",
    og_image: "",
    author_name: "",
    author_image: "",
  });

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploadingImage(true);

    try {
      const result = await uploadBlogImage(file);

      if (result.success) {
        setFormData({
          ...formData,
          featured_image: result.url,
          og_image: result.url,
        });

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "title") {
      setFormData({
        ...formData,
        title: value,
        slug: generateSlug(value),
        seo_title: value,
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Additional admin check before submission
    if (!isAdminUser) {
      toast.error("Access denied. Admin only.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];

      const seoKeywordsArray = formData.seo_keywords
        ? formData.seo_keywords
            .split(",")
            .map((keyword) => keyword.trim())
            .filter((keyword) => keyword)
        : [];

      const blogData = {
        ...formData,
        tags: tagsArray,
        seo_keywords: seoKeywordsArray,
      };

      const result = await createBlog(blogData);

      if (result.success) {
        toast.success(
          `Blog ${formData.status === "published" ? "published" : "saved as draft"} successfully!`,
        );
        router.push("/admin/blogs");
      } else {
        toast.error(result.error || "Failed to create blog");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if not admin (redirect will happen)
  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Create New Blog Post
              </h1>
              <p className="text-gray-600 mt-2">
                Write and publish a new blog article
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/blogs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Blogs
              </Link>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                  📝 Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter blog title"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="blog-url-slug"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Will be: /blog/{formData.slug || "your-blog-slug"}
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="Technology">Technology</option>
                      <option value="Gadgets">Gadgets</option>
                      <option value="Reviews">Reviews</option>
                      <option value="Tips & Tricks">Tips & Tricks</option>
                      <option value="News">News</option>
                      <option value="Tutorials">Tutorials</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tech, gadgets, review, tutorial"
                    />
                  </div>

                  {/* Status & Featured */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_featured"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="is_featured"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Mark as Featured
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                  🖼️ Featured Image
                </h2>

                {/* Image Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors mb-6"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {imagePreview || formData.featured_image ? (
                    <div className="space-y-4">
                      <div className="relative mx-auto max-w-md">
                        <img
                          src={imagePreview || formData.featured_image}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview("");
                            setFormData({
                              ...formData,
                              featured_image: "",
                              og_image: "",
                            });
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Click or drag to change image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-4xl mb-2">📷</div>
                      <h3 className="font-medium text-gray-900">
                        {uploadingImage
                          ? "Uploading..."
                          : "Upload Featured Image"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG, WebP, GIF • Max 5MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Or enter URL manually */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or enter image URL
                  </label>
                  <input
                    type="url"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 1200x630px for optimal display
                  </p>
                </div>
              </div>

              {/* Excerpt & Content */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                  📄 Content
                </h2>
                <div className="space-y-6">
                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt (Short Description)
                    </label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief summary of your blog post"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows="12"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      placeholder="Write your blog content here..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                  🔍 SEO Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SEO Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      name="seo_title"
                      value={formData.seo_title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO optimized title for search engines"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 50-60 characters
                    </p>
                  </div>

                  {/* SEO Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      name="seo_description"
                      value={formData.seo_description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO description for search results"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 150-160 characters
                    </p>
                  </div>

                  {/* SEO Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      name="seo_keywords"
                      value={formData.seo_keywords}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  {/* Meta Robots */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Robots
                    </label>
                    <select
                      name="meta_robots"
                      value={formData.meta_robots}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="index, follow">Index, Follow</option>
                      <option value="noindex, follow">Noindex, Follow</option>
                      <option value="index, nofollow">Index, Nofollow</option>
                      <option value="noindex, nofollow">
                        Noindex, Nofollow
                      </option>
                    </select>
                  </div>

                  {/* Canonical URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      name="canonical_url"
                      value={formData.canonical_url}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://yourdomain.com/blog/slug"
                    />
                  </div>

                  {/* Open Graph Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Open Graph Image
                    </label>
                    <input
                      type="url"
                      name="og_image"
                      value={formData.og_image}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/og-image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Image for social media sharing
                    </p>
                  </div>
                </div>
              </div>

              {/* Author Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                  👤 Author Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Author Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Name
                    </label>
                    <input
                      type="text"
                      name="author_name"
                      value={formData.author_name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Author name"
                    />
                  </div>

                  {/* Author Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Image URL
                    </label>
                    <input
                      type="url"
                      name="author_image"
                      value={formData.author_image}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/author.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push("/admin/blogs")}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, status: "draft" });
                    handleSubmit({ preventDefault: () => {} });
                  }}
                  disabled={loading || uploadingImage}
                  className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  type="submit"
                  onClick={() => {
                    setFormData({ ...formData, status: "published" });
                  }}
                  disabled={loading || uploadingImage}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "Publishing..." : "Publish Now"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Blog Writing Tips
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <strong>Clear Headlines:</strong> Start with compelling titles
                that grab attention
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <strong>Use Subheadings:</strong> Break content into scannable
                sections
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <strong>Add Images:</strong> Include relevant images to make
                content engaging
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <strong>Optimize for SEO:</strong> Use keywords naturally in
                title and content
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
