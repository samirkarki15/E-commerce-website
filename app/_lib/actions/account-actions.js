// app/_lib/actions/account-actions.js
"use server";

import { auth } from "@/app/_lib/auth";
import { supabaseAdmin } from "@/app/_lib/supabase/admin";

// GET USER PROFILE
export async function getUserProfile() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", session.user.email)
      .single();

    if (error || !user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        isActive: user.is_active,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// GET USER ORDER COUNT
export async function getUserOrderCount() {
  try {
    const session = await auth();

    if (!session?.user?.dbId) {
      // If dbId not available, get it from email
      if (!session?.user?.email) {
        return {
          success: false,
          error: "Not authenticated",
        };
      }

      // Get user id first
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (error || !user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      session.user.dbId = user.id;
    }

    const { count, error } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.dbId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      count: count || 0,
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
    };
  }
}
