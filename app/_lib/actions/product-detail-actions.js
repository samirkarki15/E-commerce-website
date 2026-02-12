// app/_lib/actions/product-detail-actions.js
"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Get single product by ID
export async function getProductDetail(productId) {
  try {
    console.log("🔍 Fetching product details for:", productId);

    // Get product from products table (images are stored directly here)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("is_published", true)
      .single();

    if (productError) {
      console.error("❌ Error fetching product:", productError);
      return { product: null, error: productError.message };
    }

    if (!product) {
      return { product: null, error: "Product not found" };
    }

    // Transform product data
    const transformedProduct = transformProduct(product);
    console.log("✅ Product fetched successfully:", transformedProduct.name);

    return { product: transformedProduct, error: null };
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return { product: null, error: error.message };
  }
}

// Transform product data
function transformProduct(product) {
  const discount =
    product.compare_price && product.price < product.compare_price
      ? Math.round(
          ((product.compare_price - product.price) / product.compare_price) *
            100,
        )
      : 0;

  // Process images from products.images array
  let mainImage = "/placeholder-product.jpg";
  const allImages = [];

  if (Array.isArray(product.images) && product.images.length > 0) {
    // Get first image as main
    mainImage = product.images[0];
    // All images
    allImages.push(...product.images);
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug || product.name.toLowerCase().replace(/\s+/g, "-"),
    description: product.description || "",
    shortDescription: product.short_description || "",
    price: parseFloat(product.price) || 0,
    originalPrice: product.compare_price
      ? parseFloat(product.compare_price)
      : null,
    costPrice: product.cost_price ? parseFloat(product.cost_price) : null,
    discount: discount,
    category: product.category_name || "Uncategorized",
    brand: product.brand || "",
    sku: product.sku || "",
    quantity: product.quantity || 0,
    tags: product.tags || [],
    image: mainImage,
    images: allImages,
    isPublished: product.is_published,
    isFeatured: product.is_featured || false,
    isHot: product.is_hot || false,
    isNew: product.is_new || false,
    rating: 4.5,
    reviewCount: 0,
    soldCount: product.sold_count || 0,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

// Get related products
export async function getRelatedProducts(
  categoryName,
  currentProductId,
  limit = 4,
) {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_name", categoryName)
      .eq("is_published", true)
      .neq("id", currentProductId)
      .limit(limit);

    if (error) {
      console.error("❌ Error fetching related products:", error);
      return [];
    }

    // Transform all products
    const productsWithImages = (products || []).map((product) =>
      transformProduct(product),
    );

    return productsWithImages;
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return [];
  }
}
