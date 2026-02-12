// app/_lib/actions/shop-actions.js - COMPLETE FIXED VERSION
"use server";

import { supabaseAdmin } from "@/app/_lib/supabase/admin";

/**
 * Get all products with filters
 * This is the MAIN function that handles filtering
 */
export async function getShopProducts(filters = {}) {
  const {
    category = "",
    brand = "",
    minPrice = 0,
    maxPrice = 10000,
    search = "",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 12,
  } = filters;

  try {
    console.log("🔄 [getShopProducts] Called with:", {
      category: category || "(empty)",
      brand: brand || "(empty)",
      minPrice,
      maxPrice,
      search: search || "(empty)",
      page,
      sortBy,
    });

    // Start with base query - CRITICAL
    // app/_lib/actions/shop-actions.js
    // In your getShopProducts function:

    let query = supabaseAdmin
      .from("products")
      .select(
        `
    *,
    rating,
    review_count,
    sold_count
  `,
        { count: "exact" },
      )
      .eq("is_published", true);

    console.log("✅ [getShopProducts] Base query set with rating fields");

    // Apply price filter
    query = query.gte("price", minPrice);
    query = query.lte("price", maxPrice);

    // Apply category filter
    if (category && category.trim() !== "") {
      console.log("✅ [getShopProducts] Applying category filter:", category);
      query = query.eq("category_name", category);
    }

    // Apply brand filter
    if (brand && brand.trim() !== "") {
      console.log("✅ [getShopProducts] Applying brand filter:", brand);
      query = query.eq("brand", brand);
    }

    // Apply search filter
    if (search && search.trim() !== "") {
      console.log("✅ [getShopProducts] Applying search filter:", search);
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`,
      );
    }

    // Apply sorting - ADDED RATING AND SOLD COUNT SORT OPTIONS
    if (sortBy === "price_low") {
      query = query.order("price", { ascending: true });
    } else if (sortBy === "price_high") {
      query = query.order("price", { ascending: false });
    } else if (sortBy === "name") {
      query = query.order("name", { ascending: true });
    } else if (sortBy === "rating") {
      query = query.order("rating", { ascending: false, nullsFirst: false });
    } else if (sortBy === "popular") {
      query = query.order("sold_count", {
        ascending: false,
        nullsFirst: false,
      });
    } else {
      query = query.order("created_at", { ascending: sortOrder === "asc" });
    }

    console.log("✅ [getShopProducts] Sorting applied:", sortBy);

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("❌ [getShopProducts] Supabase error:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return {
        products: [],
        total: 0,
        page,
        totalPages: 0,
        error: error.message,
      };
    }

    console.log("✅ [getShopProducts] Success:", {
      productsReturned: data?.length || 0,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    });

    // Log first product to verify rating fields exist
    if (data && data.length > 0) {
      console.log("📊 [getShopProducts] Sample product rating data:", {
        id: data[0].id,
        name: data[0].name,
        rating: data[0].rating,
        review_count: data[0].review_count,
        sold_count: data[0].sold_count,
      });
    }

    return {
      products: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      error: null,
    };
  } catch (error) {
    console.error("💥 [getShopProducts] Unexpected error:", error);
    return {
      products: [],
      total: 0,
      page,
      totalPages: 0,
      error: error.message,
    };
  }
}

/**
 * Get single product by ID with rating fields
 */
export async function getProductDetail(productId) {
  try {
    console.log("🔄 [getProductDetail] Fetching product:", productId);

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        *,
        rating,
        review_count,
        sold_count
      `,
      )
      .eq("id", productId)
      .eq("is_published", true)
      .single();

    if (error) {
      console.error("❌ [getProductDetail] Error:", error);
      return { product: null, error: error.message };
    }

    console.log("✅ [getProductDetail] Success:", {
      id: data.id,
      name: data.name,
      rating: data.rating,
      review_count: data.review_count,
      sold_count: data.sold_count,
    });

    return { product: data, error: null };
  } catch (error) {
    console.error("💥 [getProductDetail] Unexpected error:", error);
    return { product: null, error: error.message };
  }
}

/**
 * Get all unique categories from products table
 */
export async function getCategories() {
  try {
    console.log("🔄 [getCategories] Fetching categories...");

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("category_name")
      .eq("is_published", true)
      .not("category_name", "is", null);

    if (error) {
      console.error("❌ [getCategories] Error:", error);
      return [];
    }

    // Remove duplicates
    const categories = [
      ...new Set(
        data
          .map((item) => item.category_name)
          .filter(Boolean)
          .filter((cat) => cat !== null && cat !== undefined),
      ),
    ].sort();

    console.log("✅ [getCategories] Found:", categories.length);
    return categories;
  } catch (error) {
    console.error("💥 [getCategories] Unexpected error:", error);
    return [];
  }
}

/**
 * Get all unique brands from products table
 */
export async function getBrands() {
  try {
    console.log("🔄 [getBrands] Fetching brands...");

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("brand")
      .eq("is_published", true)
      .not("brand", "is", null);

    if (error) {
      console.error("❌ [getBrands] Error:", error);
      return [];
    }

    // Remove duplicates
    const brands = [
      ...new Set(
        data
          .map((item) => item.brand)
          .filter(Boolean)
          .filter((b) => b !== null && b !== undefined),
      ),
    ].sort();

    console.log("✅ [getBrands] Found:", brands.length);
    return brands;
  } catch (error) {
    console.error("💥 [getBrands] Unexpected error:", error);
    return [];
  }
}

/**
 * Get price range from all products
 */
export async function getPriceRange() {
  try {
    console.log("🔄 [getPriceRange] Calculating price range...");

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("price")
      .eq("is_published", true)
      .order("price", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("⚠️ [getPriceRange] No products found, using defaults");
      return { min: 0, max: 1000 };
    }

    const prices = data.map((item) => item.price).filter((p) => p != null);

    if (prices.length === 0) {
      return { min: 0, max: 1000 };
    }

    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));

    console.log("✅ [getPriceRange] Found:", { min, max });
    return { min, max };
  } catch (error) {
    console.error("💥 [getPriceRange] Unexpected error:", error);
    return { min: 0, max: 1000 };
  }
}
