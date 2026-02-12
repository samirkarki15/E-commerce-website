// app/_lib/actions/blog-image-actions.js
"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Upload blog image
export async function uploadBlogImage(imageFile) {
  try {
    if (!imageFile) {
      return {
        success: false,
        error: "Image file is required",
      };
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(imageFile.type)) {
      return {
        success: false,
        error: "Only JPEG, PNG, WebP, and GIF images are allowed",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return {
        success: false,
        error: "Image size should be less than 5MB",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const extension = imageFile.name.split(".").pop().toLowerCase();
    const fileName = `${timestamp}_${randomString}.${extension}`;
    const filePath = fileName; // Simple path, just the filename

    console.log("📤 Uploading to blog-images bucket:", filePath);

    // Upload to blog-images bucket
    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-images").getPublicUrl(filePath);

    console.log("✅ Blog image uploaded!");
    console.log("URL:", publicUrl);

    return {
      success: true,
      url: publicUrl,
      publicUrl: publicUrl,
      filePath: filePath,
      fileName: fileName,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
    };
  }
}

// Delete blog image
export async function deleteBlogImage(filePath) {
  try {
    if (!filePath) {
      return {
        success: false,
        error: "File path is required",
      };
    }

    const { error } = await supabase.storage
      .from("blog-images")
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Blog image deleted:", filePath);
    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
