// app/_lib/actions/blog-actions.js
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/_lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Calculate reading time
function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Get all blogs for admin
export async function getAdminBlogs(filters = {}) {
  try {
    const { status = "", page = 1, limit = 20, search = "" } = filters;

    let query = supabase
      .from("blogs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`,
      );
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return { blogs: [], total: 0, error: error.message };
    }

    return {
      blogs: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      error: null,
    };
  } catch (error) {
    return { blogs: [], total: 0, error: error.message };
  }
}

// Get published blogs for public
export async function getPublishedBlogs(options = {}) {
  try {
    const {
      page = 1,
      limit = 9,
      category = "",
      featured = false,
      excludeId = null,
    } = options;

    let query = supabase
      .from("blogs")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (featured) {
      query = query.eq("is_featured", true);
    }

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return { blogs: [], total: 0, error: error.message };
    }

    return {
      blogs: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      error: null,
    };
  } catch (error) {
    return { blogs: [], total: 0, error: error.message };
  }
}

// Get blog by slug
export async function getBlogBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) {
      return { blog: null, error: "Blog not found" };
    }

    // Increment view count
    await supabase
      .from("blogs")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", data.id);

    return { blog: data, error: null };
  } catch (error) {
    return { blog: null, error: error.message };
  }
}

// Get blog by ID (for admin/edit)
export async function getBlogById(id) {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { blog: null, error: error.message };
    }

    return { blog: data, error: null };
  } catch (error) {
    return { blog: null, error: error.message };
  }
}

// Create blog
export async function createBlog(blogData) {
  try {
    // Get session for author info
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Authentication required", blog: null };
    }

    // Validate required fields
    if (!blogData.title || !blogData.content) {
      return {
        success: false,
        error: "Title and content are required",
        blog: null,
      };
    }

    // Generate slug if not provided
    const slug = blogData.slug || generateSlug(blogData.title);

    // Calculate reading time
    const readingTime = calculateReadingTime(blogData.content);

    // Prepare blog data
    const blogToCreate = {
      title: blogData.title.trim(),
      slug,
      excerpt:
        blogData.excerpt?.trim() || blogData.content.substring(0, 200) + "...",
      content: blogData.content.trim(),
      author_id: session.user.id,
      author_name: blogData.author_name || session.user.name || "Admin",
      author_image: blogData.author_image || session.user.image,
      featured_image: blogData.featured_image || null,
      category: blogData.category || null,
      tags: Array.isArray(blogData.tags)
        ? blogData.tags
        : blogData.tags
          ? blogData.tags.split(",").map((t) => t.trim())
          : [],
      status: blogData.status || "draft",
      is_featured: blogData.is_featured === true,
      published_at:
        blogData.status === "published" ? new Date().toISOString() : null,
      reading_time: readingTime,
      seo_title: blogData.seo_title?.trim() || blogData.title.trim(),
      seo_description:
        blogData.seo_description?.trim() ||
        blogData.excerpt?.trim() ||
        blogData.content.substring(0, 160),
      seo_keywords: Array.isArray(blogData.seo_keywords)
        ? blogData.seo_keywords
        : blogData.seo_keywords
          ? blogData.seo_keywords.split(",").map((k) => k.trim())
          : [],
      meta_robots: blogData.meta_robots || "index, follow",
      canonical_url: blogData.canonical_url || null,
      og_image: blogData.og_image || blogData.featured_image || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert blog
    const { data, error } = await supabase
      .from("blogs")
      .insert([blogToCreate])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, blog: null };
    }

    revalidatePath("/admin/blogs");
    revalidatePath("/blog");

    return { success: true, blog: data, error: null };
  } catch (error) {
    return { success: false, error: error.message, blog: null };
  }
}

// Update blog
export async function updateBlog(id, blogData) {
  try {
    // Get current blog
    const { blog: existingBlog, error: fetchError } = await getBlogById(id);
    if (fetchError || !existingBlog) {
      return { success: false, error: "Blog not found", blog: null };
    }

    // Calculate reading time if content changed
    const readingTime = blogData.content
      ? calculateReadingTime(blogData.content)
      : existingBlog.reading_time;

    // Prepare update data
    const updateData = {
      title: blogData.title?.trim() || existingBlog.title,
      slug: blogData.slug || existingBlog.slug,
      excerpt: blogData.excerpt?.trim() || existingBlog.excerpt,
      content: blogData.content?.trim() || existingBlog.content,
      featured_image: blogData.featured_image || existingBlog.featured_image,
      category: blogData.category || existingBlog.category,
      tags: blogData.tags
        ? Array.isArray(blogData.tags)
          ? blogData.tags
          : blogData.tags.split(",").map((t) => t.trim())
        : existingBlog.tags,
      status: blogData.status || existingBlog.status,
      is_featured:
        blogData.is_featured !== undefined
          ? blogData.is_featured
          : existingBlog.is_featured,
      published_at:
        blogData.status === "published" && existingBlog.status !== "published"
          ? new Date().toISOString()
          : existingBlog.published_at,
      reading_time: readingTime,
      seo_title: blogData.seo_title?.trim() || existingBlog.seo_title,
      seo_description:
        blogData.seo_description?.trim() || existingBlog.seo_description,
      seo_keywords: blogData.seo_keywords
        ? Array.isArray(blogData.seo_keywords)
          ? blogData.seo_keywords
          : blogData.seo_keywords.split(",").map((k) => k.trim())
        : existingBlog.seo_keywords,
      meta_robots: blogData.meta_robots || existingBlog.meta_robots,
      canonical_url: blogData.canonical_url || existingBlog.canonical_url,
      og_image: blogData.og_image || existingBlog.og_image,
      updated_at: new Date().toISOString(),
    };

    // Update blog
    const { data, error } = await supabase
      .from("blogs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, blog: null };
    }

    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    revalidatePath(`/blog/${data.slug}`);

    return { success: true, blog: data, error: null };
  } catch (error) {
    return { success: false, error: error.message, blog: null };
  }
}

// Delete blog
export async function deleteBlog(id) {
  try {
    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/blogs");
    revalidatePath("/blog");

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get blog categories
export async function getBlogCategories() {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("category")
      .eq("status", "published")
      .not("category", "is", null);

    if (error) {
      return [];
    }

    const categories = [
      ...new Set(data.map((item) => item.category).filter(Boolean)),
    ];
    return categories.sort();
  } catch (error) {
    return [];
  }
}

// Get blog stats for admin
export async function getBlogStats() {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("status, view_count");

    if (error) {
      return {
        total: 0,
        published: 0,
        draft: 0,
        archived: 0,
        totalViews: 0,
      };
    }

    const stats = {
      total: data.length,
      published: data.filter((blog) => blog.status === "published").length,
      draft: data.filter((blog) => blog.status === "draft").length,
      archived: data.filter((blog) => blog.status === "archived").length,
      totalViews: data.reduce((sum, blog) => sum + (blog.view_count || 0), 0),
    };

    return stats;
  } catch (error) {
    return {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      totalViews: 0,
    };
  }
}
