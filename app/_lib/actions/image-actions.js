// app/_lib/actions/image-actions.js
"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function uploadProductImage(
  productId,
  imageFile,
  isPrimary = false,
) {
  try {
    if (!productId || !imageFile) {
      return {
        success: false,
        error: "Product ID and image file are required",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const extension = imageFile.name.split(".").pop().toLowerCase();

    const fileName = `${timestamp}_${randomString}.${extension}`;

    // Save in product-images bucket with productId subfolder
    // Path: productId/filename.png (inside product-images bucket)
    const filePath = `${productId}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer();

    // Upload to product-images bucket
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, arrayBuffer, {
        contentType: imageFile.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: publicUrl,
      url: publicUrl,
      image: {
        url: publicUrl,
        image_url: publicUrl,
        is_primary: isPrimary,
        file_name: fileName,
        file_path: filePath,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
    };
  }
}

export async function deleteProductImage(filePath) {
  try {
    if (!filePath) {
      return {
        success: false,
        error: "File path is required",
      };
    }

    const { error } = await supabase.storage
      .from("product-images")
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteProductImages(filePaths) {
  try {
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return {
        success: false,
        deleted: 0,
        error: "File paths array is required",
      };
    }

    const { error } = await supabase.storage
      .from("product-images")
      .remove(filePaths);

    if (error) {
      return {
        success: false,
        deleted: 0,
        error: error.message,
      };
    }

    return {
      success: true,
      deleted: filePaths.length,
    };
  } catch (error) {
    return {
      success: false,
      deleted: 0,
      error: error.message,
    };
  }
}
