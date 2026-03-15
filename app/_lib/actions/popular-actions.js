// lib/actions/popular-actions.js - FIXED WITH RATINGS
"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Get FEATURED products with images
export async function getPopularProducts(limit = 8, category = "all") {
  try {
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true);

    if (category && category !== "all") {
      query = query.eq("category_name", category);
    }

    query = query.order("created_at", { ascending: false });
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return await transformProductsWithImages(data);
  } catch (error) {
    return [];
  }
}

// New function to transform products with actual images
async function transformProductsWithImages(products) {
  const transformedProducts = await Promise.all(
    products.map(async (product) => {
      // Calculate discount
      const discount =
        product.compare_price && product.price < product.compare_price
          ? Math.round(
              ((product.compare_price - product.price) /
                product.compare_price) *
                100,
            )
          : 0;

      // Get primary image URL from Supabase Storage
      let imageUrl = null;

      if (product.images && product.images.length > 0) {
        // If images array contains URLs (assuming they're stored as full URLs)
        if (typeof product.images[0] === "string") {
          imageUrl = product.images[0];
        }
        // If images array contains objects
        else if (product.images[0] && typeof product.images[0] === "object") {
          imageUrl = product.images[0].url || product.images[0].image_url;
        }
      }

      // If no image in database, check if there are images in Supabase Storage
      if (!imageUrl) {
        imageUrl = await getProductImageFromStorage(product.id);
      }

      return {
        id: product.id,
        name: product.name,
        short_description: product.short_description || "",
        shortDescription: product.short_description || "",
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
        soldCount: product.sold_count ?? 0,
        sold_count: product.sold_count ?? 0,
        image: imageUrl || getPlaceholderImage(product.category_name),
        images: product.images || [], // Keep all images
        category: product.category_name || "Uncategorized",
        category_name: product.category_name || "Uncategorized",
        tags: product.tags || [],
        stock: product.quantity || 0,
        quantity: product.quantity || 0,
        isNew: product.is_new || false,
        is_new: product.is_new || false,
        isHot: product.is_hot || false,
        is_hot: product.is_hot || false,
        isFeatured: product.is_featured || false,
        is_featured: product.is_featured || false,
        slug: product.slug || product.name.toLowerCase().replace(/\s+/g, "-"),
      };
    }),
  );

  return transformedProducts;
}

// Function to get image from Supabase Storage
async function getProductImageFromStorage(productId) {
  try {
    // List files in the product's folder
    const { data: files, error } = await supabase.storage
      .from("product-images")
      .list(productId.toString());

    if (error) {
      return null;
    }

    if (!files || files.length === 0) {
      return null;
    }

    // Sort files by name (timestamp) to get the most recent or first one
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));
    const firstFile = sortedFiles[0];

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(`${productId}/${firstFile.name}`);

    return publicUrl;
  } catch (error) {
    return null;
  }
}

// Updated placeholder image function
function getPlaceholderImage(category) {
  // Use category-based SVGs instead of image files
  const images = {
    electronics: `https://ui-avatars.com/api/?name=Electronics&background=3b82f6&color=ffffff&size=400`,
    fashion: `https://ui-avatars.com/api/?name=Fashion&background=8b5cf6&color=ffffff&size=400`,
    "home-living": `https://ui-avatars.com/api/?name=Home&background=10b981&color=ffffff&size=400`,
    sports: `https://ui-avatars.com/api/?name=Sports&background=ef4444&color=ffffff&size=400`,
    default: `https://ui-avatars.com/api/?name=Product&background=6b7280&color=ffffff&size=400`,
  };

  const categoryKey = (category || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  return images[categoryKey] || images.default;
}

// Get product categories for filter
export async function getPopularCategories() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("category_name")
      .eq("is_published", true)
      .eq("is_featured", true)
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

    return [
      { id: "all", name: "All Popular" },
      ...categories.map((cat) => ({
        id: cat,
        name: cat,
      })),
    ].slice(0, 5);
  } catch (error) {
    return getDefaultCategories();
  }
}

function getDefaultCategories() {
  return [{ id: "all", name: "All Popular" }];
}
