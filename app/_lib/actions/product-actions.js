// app/_lib/actions/product-actions.js
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { uploadProductImage } from "./image-actions";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function getAdminProducts(filters = {}) {
  const { search = "", category = "", page = 1, limit = 20 } = filters;

  try {
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`,
      );
    }

    if (category) {
      query = query.eq("category_name", category);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching admin products:", error);
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
    console.error("Unexpected error in getAdminProducts:", error);
    return {
      products: [],
      total: 0,
      page,
      totalPages: 0,
      error: error.message,
    };
  }
}

export async function getProductById(id) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return { product: null, error: error.message };
    }

    return { product: data, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { product: null, error: error.message };
  }
}

export async function createProduct(productData) {
  try {
    if (!productData.name || !productData.price) {
      return {
        success: false,
        error: "Product name and price are required",
        product: null,
      };
    }

    console.log("Creating product with data:", productData);

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: productData.name,
          slug:
            productData.slug ||
            productData.name.toLowerCase().replace(/\s+/g, "-"),
          price: parseFloat(productData.price),
          compare_price: productData.compare_price
            ? parseFloat(productData.compare_price)
            : null,
          cost_price: productData.cost_price
            ? parseFloat(productData.cost_price)
            : null,
          sku: productData.sku || null,
          quantity: parseInt(productData.quantity) || 0,
          short_description: productData.short_description || null,
          description: productData.description || null,
          category_name: productData.category_name || null,
          brand: productData.brand || null,
          tags: Array.isArray(productData.tags) ? productData.tags : null,
          is_published: productData.is_published === true,
          is_featured: productData.is_featured === true,
          is_hot: productData.is_hot === true,
          is_new: productData.is_new === true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        error: error.message || "Failed to create product",
        product: null,
      };
    }

    console.log("Product created successfully:", data);

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true, product: data, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      product: null,
    };
  }
}

export async function updateProduct(id, productData) {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({
        ...productData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/shop");

    return { success: true, product: data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleProductStatus(id, currentStatus) {
  try {
    const { error } = await supabase
      .from("products")
      .update({
        is_published: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error toggling product status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: error.message };
  }
}

export async function getProductCategories() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("category_name")
      .not("category_name", "is", null);

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    const categories = [
      ...new Set(data.map((item) => item.category_name).filter(Boolean)),
    ];

    return categories.sort();
  } catch (error) {
    console.error("Unexpected error:", error);
    return [];
  }
}

export async function createProductWithImages(formData) {
  try {
    console.log("Creating product with form data...");

    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price")) || 0,
      quantity: parseInt(formData.get("quantity")) || 0,
      category_name: formData.get("category_name"),
      sku: formData.get("sku") || null,
      brand: formData.get("brand") || null,
      short_description: formData.get("short_description") || null,
      is_published: formData.get("is_published") === "on",
      is_featured: formData.get("is_featured") === "on",
      is_hot: formData.get("is_hot") === "on",
      is_new: formData.get("is_new") === "on",
    };

    const tagsString = formData.get("tags") || "";
    const tagsArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    productData.tags = tagsArray.length > 0 ? tagsArray : null;

    if (!productData.name || !productData.price) {
      return {
        success: false,
        error: "Product name and price are required",
        product: null,
      };
    }

    if (!formData.get("slug")) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    } else {
      productData.slug = formData.get("slug");
    }

    console.log("Creating product with data:", productData);

    // Step 1: Create product first
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert([
        {
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          images: [],
        },
      ])
      .select()
      .single();

    if (productError) {
      console.error("Product creation error:", productError);
      return {
        success: false,
        error: productError.message,
        product: null,
      };
    }

    console.log("Product created, ID:", product.id);

    const imageFiles = [];
    const images = [];

    // Get all image files from form
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image_${i}`);
      if (file && file.size > 0) {
        imageFiles.push(file);
      }
    }

    // Upload images
    if (imageFiles.length > 0) {
      console.log(`Uploading ${imageFiles.length} images...`);

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        try {
          const uploadResult = await uploadProductImage(
            product.id,
            file,
            i === 0,
          );

          if (uploadResult.success) {
            const imageUrl = uploadResult.publicUrl || uploadResult.url;
            if (imageUrl) {
              images.push(imageUrl);
              console.log("✅ Image uploaded:", imageUrl);
            }
          } else {
            console.error("Failed to upload image:", uploadResult.error);
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
        }
      }

      // Step 2: Update product with images
      if (images.length > 0) {
        console.log("Updating product with images:", images);

        const { error: updateError } = await supabase
          .from("products")
          .update({
            images: images,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (updateError) {
          console.error("Error updating product images:", updateError);
        } else {
          console.log("✅ Product updated with images");
        }
      }
    }

    console.log("✅ Product creation complete");

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return {
      success: true,
      product: { ...product, images: images },
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in createProductWithImages:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
      product: null,
    };
  }
}
