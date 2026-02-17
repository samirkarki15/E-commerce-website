// lib/actions/hot-deals-actions.js - FIXED WITH RATINGS
"use server";

import { createClient } from "@supabase/supabase-js";

// Use service role key for server actions (has full permissions)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Get HOT products with significant discounts for Hot Deals section
export async function getHotDeals(limit = 8, category = "all") {
  try {
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .eq("is_hot", true); // ✅ ONLY hot products

    // Apply category filter if not "all"
    if (category && category !== "all") {
      query = query.eq("category_name", category);
    }

    // Order by created_at (most recently marked as hot)
    query = query.order("created_at", { ascending: false });

    // Limit results
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      return [];
    }

    // If no hot products found, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    return transformProducts(data);
  } catch (error) {
    return [];
  }
}

// Helper function to transform product data - FIXED WITH RATINGS
function transformProducts(products) {
  return products.map((product) => {
    // Calculate discount if compare_price exists
    const discount =
      product.compare_price && product.price < product.compare_price
        ? Math.round(
            ((product.compare_price - product.price) / product.compare_price) *
              100,
          )
        : 0;

    // Get the main image from product.images array
    const getMainImage = (product) => {
      // Check if product has images array and it's not empty
      if (
        product.images &&
        Array.isArray(product.images) &&
        product.images.length > 0
      ) {
        return product.images[0];
      }

      // Fallback to image_url if exists
      if (product.image_url) {
        return product.image_url;
      }

      // Last resort: placeholder based on category
      const getPlaceholderImage = (category) => {
        const images = {
          electronics:
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
          fashion:
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h-300&fit=crop",
          home: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=300&fit=crop",
          sports:
            "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
          default:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
        };

        const categoryKey = (category || "").toLowerCase();
        return images[categoryKey] || images.default;
      };

      return getPlaceholderImage(product.category_name);
    };

    return {
      id: product.id,
      name: product.name,
      description:
        product.description ||
        product.short_description ||
        "No description available",
      price: parseFloat(product.price) || 0,
      originalPrice: product.compare_price
        ? parseFloat(product.compare_price)
        : null,
      discount: discount,
      // FIXED: Use actual database values instead of hardcoded
      rating: product.rating ?? 0,
      review_count: product.review_count ?? 0,
      reviewCount: product.review_count ?? 0,
      sold_count: product.sold_count ?? 0,
      soldCount: product.sold_count ?? 0,
      // Use actual product image
      image: getMainImage(product),
      // Also include the full images array for product card component
      images: product.images || [],
      category: product.category_name || "Uncategorized",
      category_name: product.category_name || "Uncategorized",
      tags: product.tags || [],
      stock: product.quantity || 0,
      quantity: product.quantity || 0,
      isNew: product.is_new || false,
      is_new: product.is_new || false,
      isHot: product.is_hot || true,
      is_hot: product.is_hot || true,
      isFeatured: product.is_featured || false,
      is_featured: product.is_featured || false,
      slug: product.slug || product.name.toLowerCase().replace(/\s+/g, "-"),
    };
  });
}

// Get hot deals categories
export async function getHotDealsCategories() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("category_name")
      .eq("is_published", true)
      .eq("is_hot", true)
      .not("category_name", "is", null)
      .limit(10);

    if (error) {
      return getDefaultCategories();
    }

    const categories = [
      ...new Set(data.map((item) => item.category_name).filter(Boolean)),
    ];

    if (categories.length === 0) {
      return getDefaultCategories();
    }

    const formattedCategories = [
      { id: "all", name: "All Hot Deals" },
      ...categories.map((cat) => ({
        id: cat,
        name: cat,
      })),
    ].slice(0, 5);

    return formattedCategories;
  } catch (error) {
    return getDefaultCategories();
  }
}

function getDefaultCategories() {
  return [{ id: "all", name: "All Hot Deals" }];
}
