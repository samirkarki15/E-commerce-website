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
      console.log("🔍 No user email in session");
      return null;
    }

    console.log("🔍 Looking up user by email:", session.user.email);

    // Try to find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .maybeSingle();

    if (error) {
      console.error("❌ Error finding user:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return null;
    }

    if (user) {
      console.log("✅ Found user ID:", user.id);
      return user.id;
    }

    // User not found, try to create one
    console.error("❌ USER NOT FOUND IN DATABASE - Creating user...");
    console.error("Session email:", session.user.email);
    console.error("Session user:", {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    });

    // Try to create user on the fly
    try {
      console.log("🔄 Attempting to create user on the fly...");

      const newUserData = {
        email: session.user.email,
        name: session.user.name || session.user.email.split("@")[0],
        image: session.user.image || null,
        role: "customer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("📝 Inserting user with data:", newUserData);

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([newUserData])
        .select("id")
        .single();

      if (insertError) {
        console.error("❌ Failed to create user - Insert error:", insertError);
        console.error(
          "Insert error details:",
          JSON.stringify(insertError, null, 2),
        );
        return null;
      }

      if (newUser) {
        console.log("✅ Created user on the fly:", newUser.id);
        return newUser.id;
      } else {
        console.error("❌ User creation returned no data");
        return null;
      }
    } catch (createError) {
      console.error("❌ Failed to create user - Exception:", createError);
      console.error("Exception details:", createError.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Error in getUserId:", error);
    return null;
  }
}

// ADD ITEM TO CART - WITH USER CREATION FALLBACK
export async function addToCart(productId, quantity = 1) {
  try {
    console.log("🛒 addToCart called for product:", productId);

    // Check authentication
    const session = await auth();

    if (!session?.user) {
      console.log("❌ User not authenticated");
      return {
        success: false,
        error: "login_required",
        message: "Please login to add items to cart",
      };
    }

    console.log("🔐 User authenticated:", session.user.email);

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

    console.log("✅ Using user ID:", userId);

    // Validate product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price, quantity, is_published")
      .eq("id", productId)
      .eq("is_published", true)
      .single();

    if (productError || !product) {
      console.error("❌ Product error:", productError);
      return { success: false, error: "Product not available" };
    }

    console.log("✅ Product found:", {
      id: product.id,
      name: product.name,
      availableQty: product.quantity,
    });

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
      console.error("❌ Cart fetch error:", cartFetchError);
    }

    if (!cart) {
      console.log("📦 Creating new cart for user ID:", userId);
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
        console.error("❌ Cart creation error:", cartError);

        // If foreign key error, user doesn't exist
        if (cartError.code === "23503") {
          console.error("💥 FOREIGN KEY ERROR - User doesn't exist!");
          console.error("Attempted user_id:", userId);
          console.error("Session email:", session.user.email);

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
      console.error("❌ Check existing error:", existingError);
    }

    if (existing) {
      console.log(
        "📝 Item already in cart, updating quantity from",
        existing.quantity,
        "to",
        existing.quantity + quantity,
      );
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("❌ Update error:", updateError);
        return { success: false, error: "Failed to update cart" };
      }
      console.log("✅ Item quantity updated successfully");
    } else {
      console.log("🆕 Adding new item to cart:", {
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
      });
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
        console.error("❌ Insert error:", insertError);
        console.error(
          "Insert error details:",
          JSON.stringify(insertError, null, 2),
        );
        return { success: false, error: "Failed to add to cart" };
      }
      console.log("✅ New item added to cart successfully");
    }

    revalidatePath("/cart");

    // Verify item was added
    const { data: verifyItems, error: verifyError } = await supabase
      .from("cart_items")
      .select("id, quantity, product_id")
      .eq("cart_id", cart.id);

    console.log("✅ Added to cart successfully!");
    console.log("🔍 Verification - Current cart items:", {
      count: verifyItems?.length || 0,
      items:
        verifyItems?.map((i) => ({
          productId: i.product_id,
          qty: i.quantity,
        })) || [],
    });

    return {
      success: true,
      message: "Added to cart",
    };
  } catch (error) {
    console.error("💥 Cart error:", error);
    console.error("Cart error details:", JSON.stringify(error, null, 2));
    return { success: false, error: "Failed to add to cart" };
  }
}

// GET CART - FETCH CART WITH ITEMS
export async function getCart() {
  try {
    const session = await auth();

    if (!session?.user) {
      console.log("No user session, returning empty cart");
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
      console.log("❌ No userId found in getCart");
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

    console.log("📥 Getting cart for userId:", userId);

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
      console.error("❌ Error fetching cart:", cartError);
      console.error("Cart error details:", JSON.stringify(cartError, null, 2));
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
      console.log(
        "📦 No cart found for user. Checking for carts in database...",
      );

      // Debug: try to fetch ANY carts for this user
      const { data: allCarts } = await supabase
        .from("carts")
        .select("id, is_active, user_id")
        .eq("user_id", userId);

      console.log("📋 All carts for user:", allCarts);

      console.log("📦 Cart not found for user, returning empty cart");
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

    console.log("📦 Cart found:", {
      cartId: cart.id,
      itemsCount: cart.cart_items?.length || 0,
    });

    // Format cart items
    const items = (cart.cart_items || []).map((item) => ({
      id: item.id,
      product: item.products,
      quantity: item.quantity,
      subtotal: (item.products?.price || 0) * item.quantity,
    }));

    console.log("📋 Formatted items:", {
      count: items.length,
      items: items.map((i) => ({
        id: i.id,
        productId: i.product?.id,
        qty: i.quantity,
      })),
    });

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
    console.error("💥 Error in getCart:", error);
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
      console.error("❌ Update error:", error);
      return { success: false, error: "Failed to update cart" };
    }

    revalidatePath("/cart");
    return { success: true, message: "Updated cart" };
  } catch (error) {
    console.error("💥 Update error:", error);
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
      console.error("❌ Delete error:", error);
      return { success: false, error: "Failed to remove item" };
    }

    revalidatePath("/cart");
    return { success: true, message: "Removed from cart" };
  } catch (error) {
    console.error("💥 Delete error:", error);
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
      console.error("❌ Clear error:", error);
      return { success: false, error: "Failed to clear cart" };
    }

    revalidatePath("/cart");
    return { success: true, message: "Cart cleared" };
  } catch (error) {
    console.error("💥 Clear error:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}
