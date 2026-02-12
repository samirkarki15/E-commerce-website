// lib/auth-utils.js
import { auth } from "@app/_lib/auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function isUserAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
