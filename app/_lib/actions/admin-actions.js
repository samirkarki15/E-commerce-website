// lib/actions/admin-actions.js - UPDATED (NEXTAUTH VERSION)
"use server";

import { auth } from "@/app/_lib/auth";
import { supabaseAdmin } from "@/app/_lib/supabase/admin";

// Check if user is admin
export async function isAdmin() {
  try {
    // Get session from NextAuth
    const session = await auth();

    if (!session?.user?.email) {
      return false;
    }

    // Check user role from database (using your users table)
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (error) {
      return false;
    }

    if (!user) {
      return false;
    }

    const isAdminUser = user.role === "admin";

    return isAdminUser;
  } catch (error) {
    return false;
  }
}

// Get all products for admin
export async function getAdminProducts() {
  try {
    // Check if user is admin
    const admin = await isAdmin();

    if (!admin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    return [];
  }
}
// GET ADMIN DASHBOARD STATS
export async function getAdminDashboardStats() {
  try {
    // Check if user is admin
    const admin = await isAdmin();

    if (!admin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get product count
    const { count: productCount, error: productError } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true });

    if (productError) {
    }

    // Get user count
    const { count: userCount, error: userError } = await supabaseAdmin
      .from("users")
      .select("id", { count: "exact", head: true });

    if (userError) {
    }

    // Get order count
    const { count: orderCount, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true });

    if (orderError) {
    }

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from("orders")
      .select("total_amount");

    let totalRevenue = 0;
    if (!revenueError && revenueData) {
      totalRevenue = revenueData.reduce(
        (sum, order) => sum + parseFloat(order.total_amount || 0),
        0,
      );
    }

    return {
      success: true,
      stats: {
        productCount: productCount || 0,
        userCount: userCount || 0,
        orderCount: orderCount || 0,
        totalRevenue: totalRevenue,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// GET ADMIN ORDERS - Updated to include shipping_address
// GET ADMIN ORDERS - Fixed version
export async function getAdminOrders(limit = 20, offset = 0) {
  try {
    // Check if user is admin
    const admin = await isAdmin();

    if (!admin) {
      return {
        success: false,
        orders: [],
        error: "Unauthorized",
      };
    }

    // Get orders without the embedded users relationship that's causing the error
    const {
      data: orders,
      error,
      count,
    } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        order_number,
        user_id,
        status,
        payment_status,
        total_amount,
        shipping_address,
        billing_address,
        created_at,
        order_items (
          id,
          product_name,
          quantity,
          total_price
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        success: false,
        orders: [],
        error: error.message,
      };
    }

    if (!orders || orders.length === 0) {
      return {
        success: true,
        orders: [],
        totalCount: 0,
      };
    }

    // Get user information separately to avoid the relationship conflict
    const userIds = orders.map((order) => order.user_id).filter((id) => id);
    let usersMap = {};

    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id, email, name")
        .in("id", userIds);

      if (!usersError && users) {
        // Create a map for quick lookup
        usersMap = users.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});
      }
    }

    // Transform orders with user info
    const transformedOrders = orders.map((order) => {
      const userInfo = usersMap[order.user_id] || {};

      return {
        id: order.id,
        orderNumber: order.order_number,
        userId: order.user_id,
        userEmail: userInfo.email || "Unknown",
        userName: userInfo.name || "Unknown",
        status: order.status,
        paymentStatus: order.payment_status,
        total: parseFloat(order.total_amount || 0),
        date: order.created_at,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        itemCount: (order.order_items || []).reduce(
          (sum, item) => sum + (item.quantity || 0),
          0,
        ),
        items: order.order_items || [],
      };
    });

    return {
      success: true,
      orders: transformedOrders,
      totalCount: count || 0,
    };
  } catch (error) {
    return {
      success: false,
      orders: [],
      error: error.message,
    };
  }
}

// GET SINGLE ORDER DETAILS (Admin) - Fixed version
export async function getAdminOrderDetail(orderId) {
  try {
    // Check if user is admin
    const admin = await isAdmin();

    if (!admin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get order without embedded users to avoid relationship conflict
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (
            id,
            name,
            images,
            price,
            sku
          )
        )
      `,
      )
      .eq("id", orderId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message || "Order not found",
      };
    }

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Get user info separately
    let userInfo = {};
    if (order.user_id) {
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("email, name, image")
        .eq("id", order.user_id)
        .single();

      if (!userError && user) {
        userInfo = user;
      }
    }

    // Transform order items
    const transformedItems = (order.order_items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName:
        item.product_name || item.products?.name || "Unknown Product",
      sku: item.products?.sku || "N/A",
      quantity: item.quantity,
      unitPrice: parseFloat(item.product_price || item.products?.price || 0),
      totalPrice: parseFloat(item.total_price || 0),
      image: item.products?.images?.[0] || "/placeholder-product.jpg",
    }));

    // Transform order
    const transformedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      userId: order.user_id,
      userName: userInfo.name || "Unknown",
      userEmail: userInfo.email || "Unknown",
      userImage: userInfo.image,
      subtotal: parseFloat(order.subtotal || 0),
      taxAmount: parseFloat(order.tax_amount || 0),
      shippingAmount: parseFloat(order.shipping_amount || 0),
      discountAmount: parseFloat(order.discount_amount || 0),
      totalAmount: parseFloat(order.total_amount || 0),
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      estimatedDelivery: order.estimated_delivery,
      deliveredAt: order.delivered_at,
      cancellationReason: order.cancellation_reason,
      cancelledAt: order.cancelled_at,
      refundAmount: order.refund_amount,
      refundedAt: order.refunded_at,
      items: transformedItems,
      itemCount: transformedItems.length,
    };

    return {
      success: true,
      order: transformedOrder,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
// UPDATE ORDER STATUS
export async function updateAdminOrderStatus(
  orderId,
  status,
  paymentStatus = null,
) {
  try {
    // Check if user is admin
    const admin = await isAdmin();

    if (!admin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
    }
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    const { error, data } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    return {
      success: true,
      message: "Order status updated",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ADMIN CANCEL ORDER
export async function adminCancelOrder(orderId, reason, sendEmail = false) {
  try {
    // Check if user is admin
    const admin = await isAdmin();

    if (!admin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the order first to check if it can be cancelled
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, users(email, name)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Check if order can be cancelled
    const cancellableStatuses = ["pending", "confirmed", "processing"];
    if (!cancellableStatuses.includes(order.status)) {
      return {
        success: false,
        error: `Order cannot be cancelled. Current status: ${order.status}`,
      };
    }

    // Check payment status - if already paid, cannot cancel (should go through refund)
    if (order.payment_status === "paid") {
      return {
        success: false,
        error:
          "Cannot cancel order that is already paid. Please process refund instead.",
      };
    }

    // Start a transaction (Supabase doesn't have transactions, but we'll handle errors)
    const updates = [];

    // 1. Update order status to cancelled
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: order.notes
          ? `${order.notes}\n\n[ADMIN CANCELLED: ${reason}]`
          : `[ADMIN CANCELLED: ${reason}]`,
      })
      .eq("id", orderId);

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Failed to cancel order",
      };
    }

    updates.push("Order status updated");

    // 2. Restore product stock
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        id,
        product_id,
        quantity,
        products (
          id,
          quantity as current_stock
        )
      `,
      )
      .eq("order_id", orderId);

    if (!itemsError && orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        if (item.products && item.product_id) {
          const currentStock = item.products.current_stock || 0;
          const newQuantity = currentStock + item.quantity;

          const { error: stockError } = await supabaseAdmin
            .from("products")
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.product_id);

          if (!stockError) {
            updates.push(`Restored stock for product ${item.product_id}`);
          }
        }
      }
    }

    // 3. If sendEmail is true and user exists, send cancellation email
    if (sendEmail && order.users?.email) {
      try {
        // Here you would integrate with your email service
        // For example, using Resend, SendGrid, etc.
        updates.push(`Cancellation email queued for ${order.users.email}`);
      } catch (emailError) {
        // Don't fail the whole operation if email fails
      }
    }

    // Revalidate paths if needed (for Next.js caching)
    // Note: This would need to be adapted based on your setup

    return {
      success: true,
      message: "Order cancelled successfully",
      updates: updates,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        userEmail: order.users?.email,
        userName: order.users?.name,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "An unexpected error occurred",
    };
  }
}

// ADMIN REFUND ORDER (for paid orders)
export async function adminRefundOrder(
  orderId,
  refundAmount = null,
  reason = "",
) {
  try {
    // Check if user is admin
    const admin = await isAdmin();

    if (!admin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, users(email, name)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Check if order is paid
    if (order.payment_status !== "paid") {
      return {
        success: false,
        error: "Order is not paid. Cannot refund.",
      };
    }

    // Determine refund amount
    const amountToRefund = refundAmount || order.total_amount;

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "refunded",
        payment_status: "refunded",
        refund_amount: amountToRefund,
        refund_reason: reason,
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: order.notes
          ? `${order.notes}\n\n[REFUNDED: ${amountToRefund} - ${reason}]`
          : `[REFUNDED: ${amountToRefund} - ${reason}]`,
      })
      .eq("id", orderId);

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Failed to process refund",
      };
    }

    // Restore product stock for refunded orders
    const { data: orderItems } = await supabaseAdmin
      .from("order_items")
      .select("product_id, quantity, products(id, quantity)")
      .eq("order_id", orderId);

    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        if (item.products && item.product_id) {
          const currentStock = item.products.quantity || 0;
          const newQuantity = currentStock + item.quantity;

          await supabaseAdmin
            .from("products")
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.product_id);
        }
      }
    }

    return {
      success: true,
      message: `Refund of रु ${amountToRefund} processed successfully`,
      refund: {
        orderId: order.id,
        orderNumber: order.order_number,
        amount: amountToRefund,
        reason: reason,
        userEmail: order.users?.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "An unexpected error occurred",
    };
  }
}

// GET ALL USERS (Admin only)
export async function getAllUsers(limit = 50, offset = 0, search = "") {
  try {
    // Check if user is admin
    const admin = await isAdmin();

    if (!admin) {
      return {
        success: false,
        users: [],
        error: "Unauthorized",
      };
    }

    let query = supabaseAdmin
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Add search filter if provided
    if (search.trim()) {
      query = query.or(
        `email.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%`,
      );
    }

    const {
      data: users,
      error,
      count,
    } = await query.range(offset, offset + limit - 1);

    if (error) {
      return {
        success: false,
        users: [],
        error: error.message,
      };
    }

    return {
      success: true,
      users: users || [],
      totalCount: count || 0,
    };
  } catch (error) {
    return {
      success: false,
      users: [],
      error: error.message,
    };
  }
}

// UPDATE USER ROLE (Admin only)
export async function updateUserRole(userId, newRole) {
  try {
    // Check if user is admin
    const admin = await isAdmin();

    if (!admin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Validate role
    const validRoles = ["customer", "admin"];
    if (!validRoles.includes(newRole)) {
      return {
        success: false,
        error: "Invalid role. Must be 'customer' or 'admin'",
      };
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: `User role updated to ${newRole}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// DELETE USER (Admin only)
export async function deleteUser(userId) {
  try {
    // Check if user is admin
    const admin = await isAdmin();

    if (!admin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // First, check if user has any orders
    const { count: orderCount } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (orderCount && orderCount > 0) {
      return {
        success: false,
        error: "Cannot delete user with existing orders",
      };
    }

    // Delete user
    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
