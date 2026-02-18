// app/_lib/actions/order-actions.js
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/_lib/auth";
import { supabaseAdmin } from "@/app/_lib/supabase/admin";
import { sendOrderNotificationEmail } from "@/app/_lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Generate unique order number
function generateOrderNumber() {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString().slice(-2) +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${dateStr}-${random}`;
}

// CREATE ORDER
export async function createOrder(orderData) {
  try {
    // 1. Get user session
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // 2. Get user ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!user) {
      return {
        success: false,
        error: "User not found in database",
      };
    }

    // 3. Get current cart
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select(
        `
        id,
        cart_items (
          id,
          quantity,
          product_id,
          products (
            id,
            name,
            price,
            quantity,
            sold_count
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!cart) {
      return {
        success: false,
        error: "Cart not found",
      };
    }

    if (!cart.cart_items || cart.cart_items.length === 0) {
      return {
        success: false,
        error: "Cart is empty",
      };
    }

    // 4. Validate stock and calculate totals
    let subtotal = 0;
    let totalItems = 0;
    const orderItems = [];

    for (const item of cart.cart_items) {
      const product = item.products;

      // Check stock
      if (product.quantity < item.quantity) {
        return {
          success: false,
          error: `Not enough stock for ${product.name}. Only ${product.quantity} available.`,
        };
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: item.quantity,
        total_price: itemTotal,
      });
    }

    // 5. Calculate other amounts
    const shippingAmount = subtotal > 500 ? 0 : 100;
    const taxAmount = 0; // Tax already included in product prices
    const totalAmount = subtotal + shippingAmount;

    // 6. Generate order number
    const orderNumber = generateOrderNumber();

    // 7. Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          order_number: orderNumber,
          total_amount: totalAmount,
          subtotal: subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          discount_amount: 0,
          status: "pending",
          payment_status: "pending",
          payment_method: orderData.paymentMethod,
          shipping_address: orderData.shippingAddress,
          billing_address:
            orderData.billingAddress || orderData.shippingAddress,
          notes: orderData.notes || "",
          estimated_delivery: getEstimatedDeliveryDate(),
        },
      ])
      .select()
      .single();

    if (orderError) {
      return {
        success: false,
        error: orderError.message || "Failed to create order",
      };
    }

    // 8. Create order items
    const orderItemsWithOrderId = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      total_price: item.total_price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      // Delete the order if items fail
      await supabase.from("orders").delete().eq("id", order.id);

      return {
        success: false,
        error: itemsError.message || "Failed to create order items",
      };
    }

    // 9. Update product stock
    for (const item of cart.cart_items) {
      await supabase
        .from("products")
        .update({
          quantity: item.products.quantity - item.quantity,
          sold_count: (item.products.sold_count || 0) + item.quantity,
        })
        .eq("id", item.product_id);
    }

    // 10. Clear cart after successful order
    await supabase.from("cart_items").delete().eq("cart_id", cart.id);

    // 11. Mark cart as inactive
    await supabase.from("carts").update({ is_active: false }).eq("id", cart.id);

    // 12. Send email notification to admin (non-blocking)
    try {
      await sendOrderNotificationEmail({
        orderNumber: order.order_number,
        customerName: orderData.shippingAddress?.full_name || "N/A",
        phoneNumber: orderData.shippingAddress?.phone_number || "N/A",
        address: orderData.shippingAddress?.address || "N/A",
        district: orderData.shippingAddress?.district || "N/A",
        notes: orderData.notes || null,
        paymentMethod: orderData.paymentMethod || "cod",
        items: orderItems,
        subtotal,
        shippingAmount,
        totalAmount,
        estimatedDelivery: getEstimatedDeliveryDate(),
        customerEmail: session.user.email,
      });
    } catch (emailError) {
    }

    revalidatePath("/orders");
    revalidatePath("/cart");

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      message: "Order placed successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "An unexpected error occurred",
    };
  }
}

// GET ORDER BY NUMBER
export async function getOrderByNumber(orderNumber) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Get user ID from database (same way as createOrder)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // First, try to get the order with maybeSingle() to avoid the "0 rows" error
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_price,
          quantity,
          total_price,
          products (
            id,
            name,
            images
          )
        )
      `,
      )
      .eq("order_number", orderNumber)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to query order",
      };
    }

    if (!order) {
      return {
        success: false,
        error: `Order not found: ${orderNumber}`,
      };
    }

    // Transform order items
    const transformedItems = (order.order_items || []).map((item) => ({
      id: item.id,
      name: item.product_name,
      price: parseFloat(item.product_price),
      quantity: item.quantity,
      total: parseFloat(item.total_price),
      image: item.products?.images?.[0] || "/placeholder-product.jpg",
    }));

    // Transform order data
    const transformedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      createdAt: order.created_at,
      estimatedDelivery: order.estimated_delivery,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      notes: order.notes,
      summary: {
        subtotal: parseFloat(order.subtotal),
        shipping: parseFloat(order.shipping_amount),
        tax: parseFloat(order.tax_amount),
        discount: parseFloat(order.discount_amount),
        total: parseFloat(order.total_amount),
      },
      items: transformedItems,
    };

    return {
      success: true,
      order: transformedOrder,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "Failed to fetch order",
    };
  }
}

// GET USER ORDERS
export async function getUserOrders(limit = 10, offset = 0) {
  try {
    // Step 1: Get session
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        orders: [],
        error: "Authentication required",
      };
    }

    // Step 2: Get user ID from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError) {
      return {
        success: false,
        orders: [],
        error: `User lookup failed: ${userError.message}`,
      };
    }

    if (!user || !user.id) {
      return {
        success: false,
        orders: [],
        error: "User not found or invalid",
      };
    }

    // Step 3: Query orders
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at,
        order_items (
          id,
          product_name,
          quantity,
          total_price
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersError) {
      return {
        success: false,
        orders: [],
        error: `Query failed: ${ordersError.message}`,
      };
    }

    if (!ordersData || ordersData.length === 0) {
      return {
        success: true,
        orders: [],
      };
    }

    // Step 4: Transform orders
    const transformedOrders = ordersData.map((order, index) => {
      try {
        if (!order || !order.id) {
          throw new Error(`Order ${index} is missing id property`);
        }

        const transformed = {
          id: order.id,
          orderNumber: order.order_number || "UNKNOWN",
          status: order.status || "unknown",
          paymentStatus: order.payment_status || "unknown",
          total: parseFloat(order.total_amount || 0),
          date: order.created_at || new Date().toISOString(),
          itemCount: (order.order_items || []).reduce(
            (sum, item) => sum + (item.quantity || 0),
            0,
          ),
          items: (order.order_items || []).map((item, itemIndex) => {
            if (!item) {
              throw new Error(`Order item ${itemIndex} is null`);
            }
            return {
              id: item.id || `item-${itemIndex}`,
              name: item.product_name || "Unknown Product",
              quantity: item.quantity || 0,
              total: parseFloat(item.total_price || 0),
            };
          }),
        };
        return transformed;
      } catch (transformError) {
        throw transformError;
      }
    });

    return {
      success: true,
      orders: transformedOrders,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      orders: [],
      error: `Server error: ${errorMsg}`,
    };
  }
}

// UPDATE ORDER STATUS (Admin only)
export async function updateOrderStatus(orderId, status, paymentStatus = null) {
  try {
    const updateData = { status };
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath("/admin/orders");
    return {
      success: true,
      message: "Order status updated",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update order",
    };
  }
}

// Helper function for estimated delivery
function getEstimatedDeliveryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 7 days from now
  return date.toISOString().split("T")[0];
}

// CANCEL ORDER
export async function cancelOrder(orderNumber, reason, userId = null) {
  try {
    // Get session if userId is not provided
    let userEmail;
    let targetUserId = userId;

    if (!targetUserId) {
      const session = await auth();
      if (!session?.user) {
        return {
          success: false,
          error: "Authentication required",
        };
      }
      userEmail = session.user.email;
    }

    // If userId is provided (admin), use it. Otherwise get from email
    if (!targetUserId) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (userError || !user) {
        return {
          success: false,
          error: "User not found",
        };
      }
      targetUserId = user.id;
    }

    // Get the order first to check if it can be cancelled
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .eq("user_id", targetUserId)
      .single();

    if (orderError || !order) {
      return {
        success: false,
        error:
          "Order not found or you don't have permission to cancel this order",
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
          "Cannot cancel order that is already paid. Please contact support for refund.",
      };
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        // Store cancellation reason in notes since there's no dedicated column
        notes: order.notes
          ? `${order.notes}\n\n[CANCELLED: ${reason}]`
          : `[CANCELLED: ${reason}]`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("user_id", targetUserId);

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Failed to cancel order",
      };
    }

    // Restore product stock - get order items with product info
    const { data: orderItems, error: itemsError } = await supabase
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
      .eq("order_id", order.id);

    if (!itemsError && orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        if (item.products && item.product_id) {
          const currentStock = item.products.current_stock || 0;
          const newQuantity = currentStock + item.quantity;

          await supabase
            .from("products")
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.product_id);

        }
      }
    }

    // Revalidate relevant paths
    revalidatePath("/orders");
    revalidatePath(`/order-confirmation/${orderNumber}`);

    return {
      success: true,
      message: "Order cancelled successfully",
      orderId: order.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "An unexpected error occurred",
    };
  }
}
