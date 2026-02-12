// app/account/page.js
"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getUserProfile,
  getUserOrderCount,
} from "@/app/_lib/actions/account-actions";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      loadUserData();
    }
  }, [status, router]);

  async function loadUserData() {
    try {
      setLoading(true);

      // Load profile
      const profileResult = await getUserProfile();
      if (profileResult.success) {
        setUserProfile(profileResult.profile);
      }

      // Load order count
      const orderResult = await getUserOrderCount();
      if (orderResult.success) {
        setOrderCount(orderResult.count);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
                {userProfile?.image ? (
                  <img
                    src={userProfile.image}
                    alt={userProfile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {userProfile?.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{userProfile?.name}</h1>
                <p className="text-blue-100">{userProfile?.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {userProfile?.role === "admin" ? "Admin" : "Customer"}
                  </span>
                  <span className="text-sm text-blue-100">
                    Member since {formatDate(userProfile?.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/orders"
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition flex items-center gap-2"
              >
                <span>📦</span>
                View Orders ({orderCount})
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <span>🚪</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Account Information
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-lg font-medium text-gray-900">
                      {userProfile?.name || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg font-medium text-gray-900">
                      {userProfile?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account</p>
                    <p className="text-lg font-medium text-gray-900">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${userProfile?.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
                      >
                        {userProfile?.role === "admin"
                          ? "Administrator"
                          : "Customer"}
                      </span>
                    </p>
                  </div>
                </div>

                {(userProfile?.address ||
                  userProfile?.city ||
                  userProfile?.country) && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-lg font-medium text-gray-900">
                      {userProfile?.address || "Not provided"}
                    </p>
                    <p className="text-gray-600">
                      {userProfile?.city && `${userProfile.city}, `}
                      {userProfile?.country}
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(userProfile?.createdAt)}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formatDate(userProfile?.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Total Orders
                </h3>
                <p className="text-3xl font-bold text-blue-600">{orderCount}</p>
                <p className="text-sm text-gray-500 mt-2">Orders placed</p>
                <Link
                  href="/orders"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all orders →
                </Link>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Account Status
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {userProfile?.isActive ? "Active" : "Inactive"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {userProfile?.isActive
                    ? "Account is active"
                    : "Account is inactive"}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Login Method
                </h3>
                <p className="text-3xl font-bold text-purple-600">Google</p>
                <p className="text-sm text-gray-500 mt-2">Using Google OAuth</p>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Links & Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-4">
                <Link
                  href="/orders"
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">My Orders</h3>
                    <p className="text-sm text-gray-500">
                      View and track orders
                    </p>
                  </div>
                </Link>

                <Link
                  href="/shop"
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Continue Shopping
                    </h3>
                    <p className="text-sm text-gray-500">Browse products</p>
                  </div>
                </Link>

                {userProfile?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Admin Dashboard
                      </h3>
                      <p className="text-sm text-gray-500">Manage store</p>
                    </div>
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-red-200 hover:bg-red-50 transition text-red-600"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🚪</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Sign Out</h3>
                    <p className="text-sm text-red-500">
                      Log out from your account
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Help */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Need Help?
              </h2>
              <div className="space-y-4">
                <Link
                  href="/contact"
                  className="flex items-center gap-3 text-blue-600 hover:text-blue-800"
                >
                  <span className="text-xl">📞</span>
                  <span>Contact Support</span>
                </Link>
                <Link
                  href="/faq"
                  className="flex items-center gap-3 text-blue-600 hover:text-blue-800"
                >
                  <span className="text-xl">❓</span>
                  <span>FAQs</span>
                </Link>
                <Link
                  href="https://wa.me/9779841234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-green-600 hover:text-green-800"
                >
                  <span className="text-xl">💬</span>
                  <span>WhatsApp Support</span>
                </Link>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-4">
                About Your Account
              </h3>
              <ul className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Logged in with Google</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>No password required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>View your order history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Contact support anytime</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
