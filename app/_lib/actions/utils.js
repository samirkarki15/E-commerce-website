// lib/actions/utils.js
"use server";

import { auth } from "@/app/_lib/auth"; // Your NextAuth auth() function
import { supabaseAdmin } from "@/_lib/supabase/admin";

// Get current user from session
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

// Check if user is admin
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: Please sign in");

  // Check role in database
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || data?.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;
}

// Check if user is authenticated
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Please sign in to continue");
  return user;
}
