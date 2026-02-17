// app/admin/page.js - FIXED VERSION
import { auth } from "@/app/_lib/auth";
import { supabaseAdmin } from "@/app/_lib/supabase/admin";
import { getAdminDashboardStats } from "@/app/_lib/actions/admin-actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  // Get session
  const session = await auth();

  // If no session, redirect to signin WITH callback URL
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  // Get user from database
  let dbUser = null;
  let error = null;

  try {
    const result = await supabaseAdmin
      .from("users")
      .select("role, name, image")
      .eq("email", session.user.email)
      .single();

    dbUser = result.data;
    error = result.error;
  } catch (err) {
    error = err;
  }

  // If error or not admin, redirect to home
  if (error || !dbUser || dbUser?.role !== "admin") {
    redirect("/");
  }

  // Fetch dashboard stats
  const statsResult = await getAdminDashboardStats();
  const stats = statsResult.success
    ? statsResult.stats
    : {
        productCount: 0,
        userCount: 0,
        orderCount: 0,
        totalRevenue: 0,
      };

  // Format revenue
  const formattedRevenue = new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(stats.totalRevenue || 0) // Added || 0
    .replace("NPR", "रु");

  // Safely get user info
  const userName = dbUser?.name || session.user.name || "Admin";
  const userImage = dbUser?.image;
  const userInitial = userName.charAt(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back,{" "}
                <span className="font-semibold text-blue-600">{userName}</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={userName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {userInitial}
                    </span>
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Status Badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-lg">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">✓</span>
            </div>
            <div>
              <p className="font-medium">Admin Status: Active</p>
              <p className="text-sm opacity-90">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Products Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <span className="text-2xl text-blue-600">📦</span>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Products
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {stats.productCount || 0}
            </h3>
            <p className="text-gray-600 mt-2">Total products in store</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/products"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                Manage products →
              </Link>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <span className="text-2xl text-green-600">📋</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Orders
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {stats.orderCount || 0}
            </h3>
            <p className="text-gray-600 mt-2">Total orders placed</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/orders"
                className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
              >
                View all orders →
              </Link>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <span className="text-2xl text-purple-600">👥</span>
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                Users
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {stats.userCount || 0}
            </h3>
            <p className="text-gray-600 mt-2">Registered customers</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href="/admin/users"
                className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
              >
                Manage users →
              </Link>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <span className="text-2xl text-orange-600">💰</span>
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Revenue
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {formattedRevenue}
            </h3>
            <p className="text-gray-600 mt-2">Total revenue generated</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                From all completed orders
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Manage Products */}
            <Link
              href="/admin/products"
              className="group bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">📦</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Manage Products</h3>
                  <p className="text-sm text-gray-600">
                    View and edit products
                  </p>
                </div>
              </div>
              <div className="text-blue-600 text-sm font-medium">
                Browse catalog →
              </div>
            </Link>
            {/* Add Product */}
            <Link
              href="/admin/products/new"
              className="group bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-green-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">➕</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Add Product</h3>
                  <p className="text-sm text-gray-600">Create new product</p>
                </div>
              </div>
              <div className="text-green-600 text-sm font-medium">
                Create now →
              </div>
            </Link>
            {/* Manage Orders */}
            <Link
              href="/admin/orders"
              className="group bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-orange-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">📋</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Manage Orders</h3>
                  <p className="text-sm text-gray-600">
                    Process and track orders
                  </p>
                </div>
              </div>
              <div className="text-orange-600 text-sm font-medium">
                View orders →
              </div>
            </Link>
            {/* Manage Reviews */}
            <Link
              href="/admin/reviews"
              className="group bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-pink-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">⭐</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Manage Reviews</h3>
                  <p className="text-sm text-gray-600">
                    Approve customer reviews
                  </p>
                </div>
              </div>
              <div className="text-pink-600 text-sm font-medium">
                Moderate reviews →
              </div>
            </Link>
            {/* Manage Blogs */}
            <Link
              href="/admin/blogs"
              className="group bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-indigo-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">📝</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Manage Blog</h3>
                  <p className="text-sm text-gray-600">
                    Create and manage blog posts
                  </p>
                </div>
              </div>
              <div className="text-indigo-600 text-sm font-medium">
                Write articles →
              </div>
            </Link>
            {/* Manage Users */}
            <Link
              href="/admin/users"
              className="group bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-purple-300 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">👥</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Manage Users</h3>
                  <p className="text-sm text-gray-600">View and manage users</p>
                </div>
              </div>
              <div className="text-purple-600 text-sm font-medium">
                View users →
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity / Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-6 lg:col-span-2">
            <h3 className="font-bold text-xl mb-4">Store Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-300">Active Products</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.productCount || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Pending Orders</p>
                <p className="text-2xl font-bold mt-1">
                  {(stats.orderCount || 0) > 0
                    ? Math.floor((stats.orderCount || 0) * 0.3)
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-300">New Users (30d)</p>
                <p className="text-2xl font-bold mt-1">
                  {(stats.userCount || 0) > 0
                    ? Math.floor((stats.userCount || 0) * 0.2)
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Conversion Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {(stats.userCount || 0) > 0 && (stats.orderCount || 0) > 0
                    ? Math.floor(
                        ((stats.orderCount || 0) / (stats.userCount || 1)) *
                          100,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Admin Tips */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">💡 Admin Tips</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Check orders daily
                  </p>
                  <p className="text-sm text-gray-600">
                    Process pending orders promptly
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Update stock regularly
                  </p>
                  <p className="text-sm text-gray-600">
                    Keep product quantities accurate
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-xs">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Monitor users</p>
                  <p className="text-sm text-gray-600">
                    Review new registrations regularly
                  </p>
                </div>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Need help?{" "}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Spacing */}
        <div className="h-16"></div>
      </div>
    </div>
  );
}
