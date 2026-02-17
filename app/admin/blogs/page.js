// app/admin/blogs/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  getAdminBlogs,
  deleteBlog,
  getBlogStats,
} from "@/app/_lib/actions/blog-actions";
import { isAdmin } from "@/app/_lib/actions/admin-actions"; // ADD THIS IMPORT

export default function AdminBlogsPage() {
  const router = useRouter();
  const [isAdminUser, setIsAdminUser] = useState(false); // ADD THIS STATE

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    totalViews: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

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

  // Load blogs and stats only if user is admin
  useEffect(() => {
    if (isAdminUser) {
      loadBlogs();
      loadStats();
    }
  }, [isAdminUser, page, statusFilter]);

  async function loadBlogs() {
    try {
      setLoading(true);
      const result = await getAdminBlogs({
        status: statusFilter,
        page,
        limit,
        search: searchTerm,
      });

      if (result.error) {
        toast.error(result.error);
        setBlogs([]);
      } else {
        setBlogs(result.blogs || []);
        setTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const result = await getBlogStats();
      setStats(result);
    } catch (error) {
    }
  }

  async function handleDeleteBlog(blogId, blogTitle) {
    // Additional admin check
    if (!isAdminUser) {
      toast.error("Access denied. Admin only.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const result = await deleteBlog(blogId);

      if (result.success) {
        toast.success("Blog deleted successfully");
        setBlogs(blogs.filter((blog) => blog.id !== blogId));
        loadStats();
      } else {
        toast.error(result.error || "Failed to delete blog");
      }
    } catch (error) {
      toast.error("Error deleting blog");
    }
  }

  function getStatusBadge(status) {
    const badges = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  }

  function formatDate(dateString) {
    if (!dateString) return "Not published";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Blog Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage your blog posts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Dashboard
              </Link>
              <Link
                href="/admin/blogs/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Blog Post
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.published}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.draft}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-600">
                {stats.archived}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalViews}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search blogs by title or content..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadBlogs()}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("published")}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === "published"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setStatusFilter("draft")}
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === "draft"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Drafts
              </button>
            </div>

            <button
              onClick={loadBlogs}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Blogs List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No blogs found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "No blogs match your search criteria"
                  : "You haven't created any blog posts yet"}
              </p>
              <Link
                href="/admin/blogs/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Create Your First Blog Post
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blog Post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {blogs.map((blog) => (
                      <tr key={blog.id} className="hover:bg-gray-50">
                        {/* Blog Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-4">
                            {blog.featured_image && (
                              <div className="w-16 h-16 flex-shrink-0">
                                <img
                                  src={blog.featured_image}
                                  alt={blog.title}
                                  className="w-16 h-16 rounded object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 mb-1">
                                {blog.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {blog.excerpt}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                /blog/{blog.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(blog.status)}`}
                          >
                            {blog.status}
                            {blog.is_featured &&
                              blog.status === "published" && (
                                <span className="ml-1">⭐</span>
                              )}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {blog.category || "Uncategorized"}
                          </span>
                        </td>

                        {/* Published Date */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(blog.published_at)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {blog.reading_time || 3} min read
                          </div>
                        </td>

                        {/* Views */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {blog.view_count || 0}
                          </div>
                          <div className="text-xs text-gray-500">views</div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/blogs/edit/${blog.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/blog/${blog.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            >
                              View
                            </Link>
                            <button
                              onClick={() =>
                                handleDeleteBlog(blog.id, blog.title)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Blog Management Tips
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <strong>SEO Optimization:</strong> Fill in SEO fields for better
                search rankings
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <strong>Featured Images:</strong> Use high-quality images
                (1200x630px recommended)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <strong>Categories & Tags:</strong> Organize content for better
                navigation
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <strong>Schedule Publishing:</strong> Set future publish dates
                for timed releases
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
