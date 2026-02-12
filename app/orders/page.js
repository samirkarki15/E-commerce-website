// app/orders/page.js
"use client";

import { useEffect, useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserOrders } from "@/app/_lib/actions/order-actions";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getUserOrders();

      if (result.success) {
        setOrders(result.orders);
      } else {
        setError(result.error || "Unknown error occurred");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Client error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/orders");
      return;
    }

    loadOrders();
  }, [status, loadOrders, router]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getStatusColor(status) {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "confirmed":
        return "bg-sky-100 text-sky-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "delivered":
        return "✓";
      case "shipped":
        return "🚚";
      case "processing":
        return "⏳";
      case "confirmed":
        return "✓";
      case "pending":
        return "⏱️";
      case "cancelled":
        return "✕";
      default:
        return "•";
    }
  }

  // Loading skeleton
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <div className="h-10 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-3"></div>
            <div className="h-5 w-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton Cards */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="h-6 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              My Orders
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 p-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-900 mb-2">
                  Unable to Load Orders
                </h2>
                <p className="text-red-700 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No orders state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              My Orders
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage all your orders
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <span className="text-4xl">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your
              orders here!
            </p>
            <Link
              href="/shop"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Orders list
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 md:px-8 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">
            You have {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`,
              }}
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        <span>{getStatusIcon(order.status)}</span>
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.date)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      रु {order.total?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 border-b border-gray-100">
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 text-right">
                        रु {item.total?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer */}
              <div className="p-6 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Payment:{" "}
                    <span className="font-medium text-gray-900">
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>

                <Link
                  href={`/order-confirmation/${order.orderNumber}`}
                  className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                >
                  View Details
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
