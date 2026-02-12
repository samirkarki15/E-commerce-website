"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Check if user has purchased AND received the product (delivered + paid)
// Replace this entire function in app/_lib/actions/review-actions.js

export async function checkUserPurchase(userId, productId) {
  try {
    console.log("🔍 Checking purchase for:", { userId, productId });

    // Get all delivered and paid orders for this user
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, status, payment_status, user_id")
      .eq("user_id", userId)
      .eq("status", "delivered")
      .eq("payment_status", "paid");

    console.log("📊 Orders found:", { orders, ordersError });

    if (ordersError) {
      console.error("❌ Error fetching orders:", ordersError);
      return { hasPurchased: false, error: ordersError.message };
    }

    if (!orders || orders.length === 0) {
      console.log("❌ No delivered & paid orders found for user");
      return { hasPurchased: false };
    }

    console.log("✅ User has", orders.length, "delivered & paid orders");

    // Get order IDs
    const orderIds = orders.map((order) => order.id);
    console.log("📋 Order IDs:", orderIds);

    // Check if this product is in any of these orders
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("id, product_id, order_id")
      .in("order_id", orderIds)
      .eq("product_id", productId);

    console.log("🛍️ Order items with this product:", {
      orderItems,
      itemsError,
    });

    if (itemsError) {
      console.error("❌ Error fetching order items:", itemsError);
      return { hasPurchased: false, error: itemsError.message };
    }

    const hasPurchased = orderItems && orderItems.length > 0;

    console.log("🎯 FINAL RESULT - hasPurchased:", hasPurchased);

    if (hasPurchased) {
      console.log("✅ User HAS purchased this product");
    } else {
      console.log("❌ User HAS NOT purchased this product");
    }

    return { hasPurchased };
  } catch (error) {
    console.error("💥 Unexpected error in checkUserPurchase:", error);
    return { hasPurchased: false, error: error.message };
  }
}

// Get reviews for a product
export async function getProductReviews(productId, options = {}) {
  const { page = 1, limit = 10, sortBy = "newest" } = options;

  try {
    let query = supabase
      .from("reviews")
      .select(
        `
        *,
        user:user_id (
          id,
          name,
          image,
          email
        )
      `,
        { count: "exact" },
      )
      .eq("product_id", productId);
    // REMOVED: .eq("is_approved", true); // Auto-approved now

    // Apply sorting
    switch (sortBy) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "highest":
        query = query.order("rating", { ascending: false });
        break;
      case "lowest":
        query = query.order("rating", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching reviews:", error);
      return { reviews: [], total: 0, averageRating: 0, error: error.message };
    }

    // Calculate average rating
    const averageRating =
      data.length > 0
        ? data.reduce((sum, review) => sum + review.rating, 0) / data.length
        : 0;

    // Get rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    return {
      reviews: data || [],
      total: count || 0,
      averageRating,
      ratingDistribution,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in getProductReviews:", error);
    return { reviews: [], total: 0, averageRating: 0, error: error.message };
  }
}

// Get review statistics for a product
export async function getReviewStatistics(productId) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", productId);
    // REMOVED: .eq("is_approved", true); // Auto-approved now

    if (error) {
      console.error("Error fetching review statistics:", error);
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        error: error.message,
      };
    }

    const totalReviews = data.length;
    const averageRating =
      totalReviews > 0
        ? data.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in getReviewStatistics:", error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      error: error.message,
    };
  }
}

// Get user's review for a product
export async function getUserReview(userId, productId) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user review:", error);
      return { review: null, error: error.message };
    }

    return { review: data || null, error: null };
  } catch (error) {
    console.error("Unexpected error in getUserReview:", error);
    return { review: null, error: error.message };
  }
}

// Check if user can review a product
export async function canUserReviewProduct(userId, productId) {
  try {
    // 1. Check if user has already reviewed
    const { review: existingReview } = await getUserReview(userId, productId);
    if (existingReview) {
      return {
        canReview: false,
        reason: "already_reviewed",
        existingReviewId: existingReview.id,
      };
    }

    // 2. Check if user has purchased AND received the product
    const { hasPurchased, error: purchaseError } = await checkUserPurchase(
      userId,
      productId,
    );

    if (purchaseError) {
      console.error("Purchase check error:", purchaseError);
      return { canReview: false, reason: "purchase_check_error" };
    }

    if (!hasPurchased) {
      return { canReview: false, reason: "not_purchased" };
    }

    // All checks passed
    return { canReview: true, reason: "eligible" };
  } catch (error) {
    console.error("Error in canUserReviewProduct:", error);
    return { canReview: false, reason: "error" };
  }
}

// Submit a review
export async function submitReview(reviewData, userId) {
  try {
    // Validate required fields
    if (!reviewData.product_id || !reviewData.rating) {
      return { success: false, error: "Product ID and rating are required" };
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Check if user can review
    const { canReview, reason } = await canUserReviewProduct(
      userId,
      reviewData.product_id,
    );

    if (!canReview) {
      switch (reason) {
        case "already_reviewed":
          return {
            success: false,
            error: "You have already reviewed this product",
          };
        case "not_purchased":
          return {
            success: false,
            error:
              "You need to purchase and receive this product before writing a review",
          };
        default:
          return {
            success: false,
            error: "You are not eligible to review this product",
          };
      }
    }

    // Validate comment word count
    if (reviewData.comment) {
      const wordCount = reviewData.comment.trim().split(/\s+/).length;
      if (wordCount > 200) {
        return { success: false, error: "Review cannot exceed 200 words" };
      }
    }

    const reviewToSubmit = {
      product_id: reviewData.product_id,
      user_id: userId,
      rating: parseInt(reviewData.rating),
      comment: reviewData.comment?.trim() || null,
      is_approved: true,
      // Let database set created_at and updated_at automatically
    };

    // Insert review
    const { data, error } = await supabase
      .from("reviews")
      .insert([reviewToSubmit])
      .select()
      .single();

    if (error) {
      console.error("Error submitting review:", error);
      return { success: false, error: error.message };
    }

    // Update product rating statistics
    await updateProductRatingStats(reviewData.product_id);

    revalidatePath(`/product/${reviewData.product_id}`);
    revalidatePath("/");

    return {
      success: true,
      review: data,
      error: null,
      message: "Review submitted successfully! Your review is now visible.",
    };
  } catch (error) {
    console.error("Unexpected error in submitReview:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

// Update a review
export async function updateUserReview(reviewId, reviewData, userId) {
  try {
    // First, verify the review belongs to the user
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

    if (fetchError) {
      return { success: false, error: "Review not found" };
    }

    if (existingReview.user_id !== userId) {
      return { success: false, error: "You can only edit your own reviews" };
    }

    // Validate rating
    if (reviewData.rating && (reviewData.rating < 1 || reviewData.rating > 5)) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Prepare update data
    const updateData = {
      rating: reviewData.rating
        ? parseInt(reviewData.rating)
        : existingReview.rating,
      title: reviewData.title?.trim() || existingReview.title,
      comment: reviewData.comment?.trim() || existingReview.comment,
      updated_at: new Date().toISOString(),
    };

    // Update review
    const { data, error } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", reviewId)
      .select()
      .single();

    if (error) {
      console.error("Error updating review:", error);
      return { success: false, error: error.message };
    }

    // Update product rating statistics
    await updateProductRatingStats(existingReview.product_id);

    revalidatePath(`/product/${existingReview.product_id}`);

    return { success: true, review: data, error: null };
  } catch (error) {
    console.error("Unexpected error in updateUserReview:", error);
    return { success: false, error: error.message };
  }
}

// Delete a review
export async function deleteUserReview(reviewId, userId) {
  try {
    // First, verify the review belongs to the user
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

    if (fetchError) {
      return { success: false, error: "Review not found" };
    }

    if (existingReview.user_id !== userId) {
      return { success: false, error: "You can only delete your own reviews" };
    }

    // Delete review
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Error deleting review:", error);
      return { success: false, error: error.message };
    }

    // Update product rating statistics
    await updateProductRatingStats(existingReview.product_id);

    revalidatePath(`/product/${existingReview.product_id}`);

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error in deleteUserReview:", error);
    return { success: false, error: error.message };
  }
}

// app/_lib/actions/review-actions.js
// Update this function to ensure it's working properly

async function updateProductRatingStats(productId) {
  try {
    console.log("🔄 Updating rating stats for product:", productId);

    const { averageRating, totalReviews } =
      await getReviewStatistics(productId);

    console.log("📊 Calculated stats:", { averageRating, totalReviews });

    // Update product table with new rating statistics
    const { error, data } = await supabase
      .from("products")
      .update({
        rating: Math.round(averageRating * 10) / 10, // Keep one decimal
        review_count: totalReviews,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select();

    if (error) {
      console.error("❌ Error updating product rating stats:", error);
    } else {
      console.log("✅ Successfully updated product rating:", data);
    }
  } catch (error) {
    console.error("💥 Error in updateProductRatingStats:", error);
  }
}

// Get reviews for admin approval
export async function getPendingReviews() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        product:product_id (
          id,
          name,
          images
        ),
        user:user_id (
          id,
          name,
          email
        )
      `,
      )
      .eq("is_approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending reviews:", error);
      return { reviews: [], error: error.message };
    }

    return { reviews: data || [], error: null };
  } catch (error) {
    console.error("Unexpected error in getPendingReviews:", error);
    return { reviews: [], error: error.message };
  }
}

// Approve/Reject review (admin only)
export async function updateReviewStatus(reviewId, isApproved) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .update({
        is_approved: isApproved,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (error) {
      console.error("Error updating review status:", error);
      return { success: false, error: error.message };
    }

    // If approved, update product rating stats
    if (isApproved) {
      await updateProductRatingStats(data.product_id);
    }

    revalidatePath("/admin/reviews");
    revalidatePath(`/product/${data.product_id}`);

    return { success: true, review: data, error: null };
  } catch (error) {
    console.error("Unexpected error in updateReviewStatus:", error);
    return { success: false, error: error.message };
  }
}

// app/_lib/actions/review-actions.js - ADD THIS FUNCTION

// Get ALL reviews for admin management
export async function getAllReviewsForAdmin(filters = {}) {
  const { productId = null, page = 1, limit = 20, search = "" } = filters;

  try {
    let query = supabase
      .from("reviews")
      .select(
        `
        *,
        product:product_id (
          id,
          name,
          images
        ),
        user:user_id (
          id,
          name,
          email,
          image
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (productId) {
      query = query.eq("product_id", productId);
    }

    if (search) {
      query = query.or(
        `product.name.ilike.%${search}%,user.name.ilike.%${search}%,comment.ilike.%${search}%`,
      );
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching all reviews:", error);
      return { reviews: [], total: 0, error: error.message };
    }

    return {
      reviews: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in getAllReviewsForAdmin:", error);
    return { reviews: [], total: 0, error: error.message };
  }
}

// Get review statistics for admin dashboard
export async function getAdminReviewStats() {
  try {
    // Get all reviews
    const { data, error } = await supabase.from("reviews").select("rating");

    if (error) {
      console.error("Error fetching review stats:", error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        error: error.message,
      };
    }

    const totalReviews = data.length;
    const averageRating =
      totalReviews > 0
        ? data.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in getAdminReviewStats:", error);
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      error: error.message,
    };
  }
}

// app/_lib/actions/review-actions.js - ADD THIS FUNCTION

// Delete review as admin (no user permission check)
export async function deleteReviewAsAdmin(reviewId) {
  try {
    // First get the product_id to update stats later
    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("product_id")
      .eq("id", reviewId)
      .single();

    if (fetchError) {
      console.error("Error fetching review for deletion:", fetchError);
      return { success: false, error: "Review not found" };
    }

    // Delete the review
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Error deleting review:", error);
      return { success: false, error: error.message };
    }

    // Update product rating statistics
    await updateProductRatingStats(review.product_id);

    revalidatePath("/admin/reviews");
    revalidatePath(`/product/${review.product_id}`);

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error in deleteReviewAsAdmin:", error);
    return { success: false, error: error.message };
  }
}
