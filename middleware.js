// middleware.js - FIXED VERSION
import { NextResponse } from "next/server";
import { auth } from "@/app/_lib/auth"; // Import the auth function

export default auth(async function middleware(req) {
  console.log("🔐 Middleware running for:", req.nextUrl.pathname);

  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  // Debug: Log all cookies
  const cookies = req.cookies.getAll();
  console.log(
    "🍪 Cookies found:",
    cookies.map((c) => c.name),
  );

  // Check if user is authenticated
  const session = req.auth;
  console.log("👤 Session exists:", !!session);
  if (session) {
    console.log("User email:", session.user?.email);
  }

  // If trying to access admin without auth, redirect to signin
  if (isAdminPage && !session) {
    console.log("❌ No session for admin, redirecting to signin");
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // If authenticated and trying to access auth pages, redirect to home
  if (isAuthPage && session) {
    console.log("✅ Already authenticated, redirecting from auth page");
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
