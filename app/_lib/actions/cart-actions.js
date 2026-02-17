// app/_lib/actions/cart-actions.js - FIXED VERSION
"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/app/_lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Get session ID from cookies
async function getSessionId() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cart_session")?.value;

  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    cookieStore.set("cart_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return sessionId;
}

// Get user ID - WITH BETTER ERROR HANDLING
export async function getUserId() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return null;
    }

    // Try to find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .maybeSingle();

    if (error) {
      return null;
    }

    if (user) {
      return user.id;
    }

    // User not found, try to create one

    // Try to create user on the fly
    try {
      const newUserData = {
        email: session.user.email,
        name: session.user.name || session.user.email.split("@")[0],
        image: session.user.image || null,
        role: "customer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([newUserData])
        .select("id")
        .single();

      if (insertError) {
        return null;
      }

      if (newUser) {
        return newUser.id;
      } else {
        return null;
      }
    } catch (createError) {
      return null;
    }
  } catch (error) {
    return null;
  }
}

// ADD ITEM TO CART - WITH USER CREATION FALLBACK
export async function addToCart(productId, quantity = 1) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "login_required",
        message: "Please login to add items to cart",
      };
    }

    // Get user ID (with auto-create fallback)
    const userId = await getUserId();

    if (!userId) {
      return {
        success: false,
        error: "user_not_found",
        message:
          "Your account needs to be created. Please try logging in again.",
      };
    }

    // Validate product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price, quantity, is_published")
      .eq("id", productId)
      .eq("is_published", true)
      .single();

    if (productError || !product) {
      return { success: false, error: "Product not available" };
    }

    if (product.quantity < quantity) {
      return { success: false, error: `Only ${product.quantity} in stock` };
    }

    // Get or create cart
    let { data: cart, error: cartFetchError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (cartFetchError) {
    }

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from("carts")
        .insert([
          {
            user_id: userId,
            session_id: null,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (cartError) {
        // If foreign key error, user doesn't exist
        if (cartError.code === "23503") {
          return {
            success: false,
            error: "account_error",
            message:
              "Your account needs to be set up. Please log out and log back in.",
          };
        }

        return { success: false, error: "Failed to create cart" };
      }
      cart = newCart;
    }

    // Check if item already exists
    const { data: existing, error: existingError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingError) {
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        return { success: false, error: "Failed to update cart" };
      }
    } else {
      const { error: insertError } = await supabase.from("cart_items").insert([
        {
          cart_id: cart.id,
          product_id: productId,
          quantity: quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        return { success: false, error: "Failed to add to cart" };
      }
    }

    revalidatePath("/cart");

    // Verify item was added
    const { data: verifyItems, error: verifyError } = await supabase
      .from("cart_items")
      .select("id, quantity, product_id")
      .eq("cart_id", cart.id);

    return {
      success: true,
      message: "Added to cart",
    };
  } catch (error) {
    return { success: false, error: "Failed to add to cart" };
  }
}

// GET CART - FETCH CART WITH ITEMS
export async function getCart() {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        id: null,
        items: [],
        summary: {
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
        },
        total: 0,
        itemCount: 0,
      };
    }

    const userId = await getUserId();

    if (!userId) {
      return {
        id: null,
        items: [],
        summary: {
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
        },
        total: 0,
        itemCount: 0,
      };
    }

    // Get active cart for user
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select(
        `
        id,
        created_at,
        updated_at,
        cart_items (
          id,
          quantity,
          products (
            id,
            name,
            price,
            images
          )
        )
      `,
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (cartError) {
      return {
        id: null,
        items: [],
        summary: {
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
        },
        total: 0,
        itemCount: 0,
      };
    }

    if (!cart) {
      return {
        id: null,
        items: [],
        summary: {
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
        },
        total: 0,
        itemCount: 0,
      };
    }

    // Format cart items
    const items = (cart.cart_items || []).map((item) => ({
      id: item.id,
      product: item.products,
      quantity: item.quantity,
      subtotal: (item.products?.price || 0) * item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Calculate shipping (free over $100)
    const shipping = subtotal > 100 ? 0 : 10;

    // Calculate tax (10%)
    const tax = (subtotal + shipping) * 0.1;
    const total = subtotal + shipping + tax;

    return {
      id: cart.id,
      items,
      summary: {
        subtotal,
        shipping,
        tax,
        total,
        itemCount,
      },
      total,
      itemCount,
    };
  } catch (error) {
    return {
      id: null,
      items: [],
      summary: {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
      },
      total: 0,
      itemCount: 0,
    };
  }
}

// UPDATE CART ITEM QUANTITY
export async function updateCartItem(itemId, quantity) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "login_required",
        message: "Please login to update cart",
      };
    }

    if (quantity < 1) {
      return { success: false, error: "Invalid quantity" };
    }

    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) {
      return { success: false, error: "Failed to update cart" };
    }

    revalidatePath("/cart");
    return { success: true, message: "Updated cart" };
  } catch (error) {
    return { success: false, error: "Failed to update cart" };
  }
}

// REMOVE FROM CART
export async function removeFromCart(itemId) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "login_required",
        message: "Please login to remove items",
      };
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      return { success: false, error: "Failed to remove item" };
    }

    revalidatePath("/cart");
    return { success: true, message: "Removed from cart" };
  } catch (error) {
    return { success: false, error: "Failed to remove item" };
  }
}

// CLEAR CART
export async function clearCart() {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "login_required",
        message: "Please login to clear cart",
      };
    }

    const userId = await getUserId();

    if (!userId) {
      return {
        success: false,
        error: "user_not_found",
        message: "Could not clear cart",
      };
    }

    // Get cart for user
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (!cart) {
      return {
        success: false,
        error: "cart_not_found",
        message: "Cart not found",
      };
    }

    // Delete all items from cart
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id);

    if (error) {
      return { success: false, error: "Failed to clear cart" };
    }

    revalidatePath("/cart");
    return { success: true, message: "Cart cleared" };
  } catch (error) {
    return { success: false, error: "Failed to clear cart" };
  }
}
