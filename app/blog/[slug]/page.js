// app/blog/[slug]/page.js
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getBlogBySlug,
  getPublishedBlogs,
} from "@/app/_lib/actions/blog-actions";
import { format } from "date-fns";
import ShareButtons from "./ShareButtons";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { blog, error } = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: blog.seo_title || blog.title,
    description: blog.seo_description || blog.excerpt,
    keywords: blog.seo_keywords?.join(", ") || "",
    authors: [{ name: blog.author_name }],
    openGraph: {
      title: blog.seo_title || blog.title,
      description: blog.seo_description || blog.excerpt,
      type: "article",
      publishedTime: blog.published_at,
      authors: [blog.author_name],
      images:
        blog.og_image || blog.featured_image
          ? [
              {
                url: blog.og_image || blog.featured_image,
                width: 1200,
                height: 630,
                alt: blog.title,
              },
            ]
          : [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.seo_title || blog.title,
      description: blog.seo_description || blog.excerpt,
      images: [blog.og_image || blog.featured_image || ""],
    },
    robots: blog.meta_robots || "index, follow",
    alternates: {
      canonical: blog.canonical_url || `/blog/${blog.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const { blog, error } = await getBlogBySlug(slug);

  if (error || !blog) {
    notFound();
  }

  // Get related posts
  const { blogs: relatedPosts } = await getPublishedBlogs({
    limit: 3,
    category: blog.category,
    excludeId: blog.id,
  });

  // Format date
  const publishedDate = blog.published_at
    ? new Date(blog.published_at)
    : new Date(blog.created_at);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              ← Back to Blog
            </Link>
            <div className="text-sm text-gray-500">
              {blog.view_count || 0} views
            </div>
          </div>
        </div>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link href="/blog" className="hover:text-blue-600">
                Blog
              </Link>
            </li>
            <li>›</li>
            <li className="text-gray-900 font-medium truncate max-w-xs">
              {blog.title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          {blog.category && (
            <Link
              href={`/blog?category=${encodeURIComponent(blog.category)}`}
              className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors mb-4"
            >
              {blog.category}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8">
            {/* Author */}
            <div className="flex items-center gap-3">
              {blog.author_image ? (
                <Image
                  src={blog.author_image}
                  alt={blog.author_name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {blog.author_name?.charAt(0) || "A"}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {blog.author_name || "Admin"}
                </p>
                <p className="text-sm">
                  {format(publishedDate, "MMMM d, yyyy")} •{" "}
                  {blog.reading_time || 5} min read
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm">👁️ {blog.view_count || 0} views</span>
            </div>
          </div>

          {/* Featured Image */}
          {blog.featured_image && (
            <div className="relative aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-8">
              <Image
                src={blog.featured_image}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {/* Render content with proper formatting */}
          <div className="text-gray-700 leading-relaxed text-lg space-y-6">
            {blog.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Share this article
            </h3>
            <ShareButtons title={blog.title} excerpt={blog.excerpt} />
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {blog.author_image ? (
              <Image
                src={blog.author_image}
                alt={blog.author_name}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {blog.author_name?.charAt(0) || "A"}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                About {blog.author_name || "the Author"}
              </h3>
              <p className="text-gray-600">
                {blog.author_name || "The author"} writes about technology,
                gadgets, and the latest trends in the tech world. With a passion
                for innovation and a keen eye for detail, they bring insightful
                perspectives to the world of technology.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              You might also like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="text-xs text-gray-500">
                      {format(
                        new Date(post.published_at || post.created_at),
                        "MMM d, yyyy",
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-t border-gray-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Back to All Articles
          </Link>
          <div className="text-sm text-gray-600">
            Need help?{" "}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800">
              Contact us
            </Link>
          </div>
        </div>
      </article>

      {/* Newsletter CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Stay Updated with Tech Trends
          </h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest tech insights, gadget
            reviews, and exclusive offers delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
