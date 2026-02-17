// app/_lib/actions/auth-actions.js - UPDATED WITH NEXT AUTH ID
"use server";

import { supabaseAdmin } from "@/app/_lib/supabase/admin";
import { auth } from "@/app/_lib/auth";

// Add this at the top - list of admin emails
const ADMIN_EMAILS = [
  "your-admin-email@gmail.com", // ← YOUR EMAIL HERE
  "admin@example.com",
];

// UPDATED: Accept NextAuth user ID parameter
export async function createOrGetUser(email, name, image, nextAuthId = null) {
  try {
    // FIRST: Try to find existing user by email
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (findError && findError.code !== "PGRST116") {
      throw findError;
    }

    if (existingUser) {
      return existingUser;
    }

    // Determine role based on email
    const normalizedEmail = email.toLowerCase();
    const isAdminEmail = ADMIN_EMAILS.includes(normalizedEmail);
    const role = isAdminEmail ? "admin" : "customer";

    // Prepare user data
    const userData = {
      email,
      name,
      image,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // IMPORTANT: Try to use NextAuth ID if provided
    if (nextAuthId) {
      userData.id = nextAuthId;
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (insertError) {
      // If ID conflict (NextAuth ID already exists with different email)
      if (insertError.code === "23505") {

        // Try creating without the ID (let Supabase generate one)
        delete userData.id;

        const { data: fallbackUser, error: fallbackError } = await supabaseAdmin
          .from("users")
          .insert([userData])
          .select()
          .single();

        if (fallbackError) {
          throw fallbackError;
        }

        return fallbackUser;
      }

      throw insertError;
    }

    return newUser;
  } catch (error) {
    throw error;
  }
}

// ADD THIS: Get user by email (for cart system)
export async function getUserByEmail(email) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// ADD THIS: Get user by ID
export async function getUserById(id) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// ADD THIS: Sync NextAuth user to database
export async function syncNextAuthUser(nextAuthUser) {
  try {
    if (!nextAuthUser?.email) {
      throw new Error("No email provided");
    }

    const user = await createOrGetUser(
      nextAuthUser.email,
      nextAuthUser.name,
      nextAuthUser.image,
      nextAuthUser.id, // Pass NextAuth ID
    );

    return user;
  } catch (error) {
    throw error;
  }
}

// Keep your existing functions but update them to use getUserByEmail

// Function to make existing user admin
export async function makeUserAdmin(email) {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        role: "admin",
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Function to check and upgrade user role
export async function checkAndUpgradeRole(email) {
  try {
    const normalizedEmail = email.toLowerCase();
    const isAdminEmail = ADMIN_EMAILS.includes(normalizedEmail);

    if (!isAdminEmail) {
      return false;
    }

    // Check current role
    const user = await getUserByEmail(email);

    if (!user) {
      return false;
    }

    // If not admin, upgrade to admin
    if (user.role !== "admin") {
      await makeUserAdmin(email);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

// Update requireAdmin to use getUserByEmail
export async function requireAdmin() {
  try {
    // Get current session
    const session = await auth();

    if (!session?.user?.email) {
      throw new Error("Not authenticated");
    }

    // First, check if this email should be admin
    await checkAndUpgradeRole(session.user.email);

    // Check if user is admin in database
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "admin") {
      throw new Error("Admin access required");
    }

    return true;
  } catch (error) {
    throw error;
  }
}

export async function isUserAdmin() {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return null;
    }

    // Get user from database
    return await getUserByEmail(session.user.email);
  } catch (error) {
    return null;
  }
}
