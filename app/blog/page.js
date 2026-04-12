// app/blog/page.js
import Link from "next/link";
import {
  getPublishedBlogs,
  getBlogCategories,
} from "@/app/_lib/actions/blog-actions";

export const metadata = {
  title: "Tech Blog - Latest Gadgets & Tech Insights | SmartXstore",
  description:
    "Stay updated with our latest articles on smart gadgets, tech trends, and expert insights. Explore tips to enhance your tech lifestyle.",
  keywords:
    "tech blog, gadgets blog, technology news, smart devices, tech tips",
  openGraph: {
    title: "Tech Blog - Latest Gadgets & Tech Insights",
    description:
      "Stay updated with our latest articles on smart gadgets and tech trends",
    type: "website",
  },
};

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page) || 1;
  const category = params.category || "";

  const { blogs, total, totalPages } = await getPublishedBlogs({
    page,
    limit: 9,
    category,
  });

  const categories = await getBlogCategories();
  const featuredBlogs = blogs.filter((blog) => blog.is_featured);
  const regularBlogs = blogs.filter((blog) => !blog.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - NEW DESIGN */}
      <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              SmartXstore
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-200">
                Tech Blog
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-10 max-w-3xl mx-auto">
              Your daily dose of tech insights, gadget reviews, and innovation
              updates
            </p>
            <p className="text-lg text-emerald-200 max-w-2xl mx-auto">
              Expert articles to help you stay ahead in the world of technology
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{total}</div>
                <div className="text-emerald-200 text-sm">Total Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {categories.length}
                </div>
                <div className="text-emerald-200 text-sm">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {featuredBlogs.length}
                </div>
                <div className="text-emerald-200 text-sm">Featured Posts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Filter - NEW DESIGN */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Browse by Category
              </h2>
              <p className="text-gray-600 mt-2">
                Discover articles that match your interests
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
              <span className="text-emerald-700 font-medium">
                {total} articles
              </span>
              <span className="text-emerald-400">•</span>
              <span className="text-emerald-700 font-medium">
                {categories.length} topics
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/blog"
              className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${
                !category
                  ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Articles
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Posts - NEW DESIGN */}
        {featuredBlogs.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Featured Stories
                </h2>
                <p className="text-gray-600 mt-2">
                  Handpicked articles you shouldn't miss
                </p>
              </div>
              <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                Editor's Choice
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredBlogs.map((blog, index) => (
                <article
                  key={blog.id}
                  className={`group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                    index === 0 ? "lg:col-span-2" : ""
                  }`}
                >
                  <Link href={`/blog/${blog.slug}`}>
                    <div className="flex flex-col lg:flex-row">
                      {/* Image */}
                      <div
                        className={`relative ${index === 0 ? "lg:w-1/2" : "lg:w-2/5"}`}
                      >
                        <div className="aspect-video lg:aspect-square lg:h-full overflow-hidden">
                          {blog.featured_image ? (
                            <img
                              src={blog.featured_image}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                              <span className="text-white text-4xl">📱</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-emerald-600 text-xs font-bold rounded-full">
                            Featured
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div
                        className={`p-8 ${index === 0 ? "lg:w-1/2" : "lg:w-3/5"}`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                            {blog.category || "Technology"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {blog.reading_time || 5} min read
                          </span>
                        </div>

                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                          {blog.title}
                        </h3>

                        <p className="text-gray-600 mb-6 line-clamp-2">
                          {blog.excerpt}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {blog.author_name?.charAt(0) || "A"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {blog.author_name || "SmartGadget Team"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {blog.published_at
                                  ? new Date(
                                      blog.published_at,
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Recently published"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              👁️ {blog.view_count || 0}
                            </span>
                            <span className="text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                              Read Article →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* All Posts Grid - NEW DESIGN */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Latest Articles
              </h2>
              <p className="text-gray-600 mt-2">
                Fresh content updated regularly
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              Showing {regularBlogs.length} of {total} articles
            </div>
          </div>

          {regularBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href={`/blog/${blog.slug}`}>
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden">
                      {blog.featured_image ? (
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-5xl">📝</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-emerald-600 text-xs font-bold rounded-full">
                          {blog.category || "Technology"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">
                          {blog.reading_time || 5} min read
                        </span>
                        <span className="text-xs text-gray-500">
                          {blog.published_at
                            ? new Date(blog.published_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "New"}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {blog.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {blog.author_name?.charAt(0) || "A"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {blog.author_name || "SmartGadget Team"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            👁️ {blog.view_count || 0}
                          </span>
                          <span className="text-emerald-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                            Read →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="text-7xl mb-6">📰</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No articles found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {category
                  ? `No articles found in "${category}" category. Check back soon!`
                  : "Our blog is coming soon. Stay tuned for amazing tech content!"}
              </p>
              {category && (
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
                >
                  View All Articles
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination - NEW DESIGN */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-16">
            {page > 1 && (
              <Link
                href={`/blog?page=${page - 1}${category ? `&category=${category}` : ""}`}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </Link>
            )}

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Link
                    key={pageNum}
                    href={`/blog?page=${pageNum}${category ? `&category=${category}` : ""}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      page === pageNum
                        ? "bg-emerald-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            {page < totalPages && (
              <Link
                href={`/blog?page=${page + 1}${category ? `&category=${category}` : ""}`}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        )}

        {/* Benefits Section - NEW DESIGN */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why Read Our Tech Blog?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-3">
              We provide valuable insights to help you make better tech
              decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-emerald-600">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Expert-Backed Insights
              </h3>
              <p className="text-gray-600">
                Get professional advice from industry experts with years of
                experience in tech and gadgets.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-teal-600">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Trend Analysis
              </h3>
              <p className="text-gray-600">
                Stay ahead with in-depth analysis of emerging technologies and
                market trends.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-blue-600">💡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Practical Solutions
              </h3>
              <p className="text-gray-600">
                Learn actionable tips to get the most out of your devices and
                enhance your tech lifestyle.
              </p>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Explore Popular Topics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="text-2xl mb-2">
                  {cat === "Smartphones" && "📱"}
                  {cat === "Laptops" && "💻"}
                  {cat === "Wearables" && "⌚"}
                  {cat === "Gaming" && "🎮"}
                  {cat === "Audio" && "🎧"}
                  {cat === "Home Tech" && "🏠"}
                  {cat === "Reviews" && "⭐"}
                  {![
                    "Smartphones",
                    "Laptops",
                    "Wearables",
                    "Gaming",
                    "Audio",
                    "Home Tech",
                    "Reviews",
                  ].includes(cat) && "🔧"}
                </div>
                <h3 className="font-medium text-gray-900">{cat}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
