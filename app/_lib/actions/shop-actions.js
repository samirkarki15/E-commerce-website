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

    // Apply price filter
    query = query.gte("price", minPrice);
    query = query.lte("price", maxPrice);

    // Apply category filter
    if (category && category.trim() !== "") {
      query = query.eq("category_name", category);
    }

    // Apply brand filter
    if (brand && brand.trim() !== "") {
      query = query.eq("brand", brand);
    }

    // Apply search filter
    if (search && search.trim() !== "") {
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

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      return {
        products: [],
        total: 0,
        page,
        totalPages: 0,
        error: error.message,
      };
    }

    return {
      products: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      error: null,
    };
  } catch (error) {
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
      return { product: null, error: error.message };
    }

    return { product: data, error: null };
  } catch (error) {
    return { product: null, error: error.message };
  }
}

/**
 * Get all unique categories from products table
 */
export async function getCategories() {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("category_name")
      .eq("is_published", true)
      .not("category_name", "is", null);

    if (error) {
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

    return categories;
  } catch (error) {
    return [];
  }
}

/**
 * Get all unique brands from products table
 */
export async function getBrands() {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("brand")
      .eq("is_published", true)
      .not("brand", "is", null);

    if (error) {
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

    return brands;
  } catch (error) {
    return [];
  }
}

/**
 * Get price range from all products
 */
export async function getPriceRange() {
  try {

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("price")
      .eq("is_published", true)
      .order("price", { ascending: true });

    if (error || !data || data.length === 0) {
      return { min: 0, max: 1000 };
    }

    const prices = data.map((item) => item.price).filter((p) => p != null);

    if (prices.length === 0) {
      return { min: 0, max: 1000 };
    }

    const min = 0;
    const max = Math.ceil(Math.max(...prices));

    return { min, max };
  } catch (error) {
    return { min: 0, max: 1000 };
  }
}
