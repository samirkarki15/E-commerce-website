// app/order-confirmation/[orderNumber]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getOrderByNumber,
  cancelOrder,
} from "@/app/_lib/actions/order-actions";
import { useSession } from "next-auth/react";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const orderNumber = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    loadOrder();
  }, [status, orderNumber]);

  async function loadOrder() {
    try {
      setLoading(true);
      setError(null);
      const result = await getOrderByNumber(orderNumber);

      if (result.success) {
        setOrder(result.order);
      } else {
        setError(result.error || "Order not found");
      }
    } catch (err) {
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelOrder() {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    setCancelling(true);
    try {
      const result = await cancelOrder(orderNumber, cancelReason);

      if (result.success) {
        // Refresh order data
        await loadOrder();
        setShowCancelConfirm(false);
        setCancelReason("");
        alert("Order has been cancelled successfully");
      } else {
        alert(result.error || "Failed to cancel order");
      }
    } catch (err) {
      alert("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  }

  // Check if order can be cancelled
  function canCancelOrder() {
    if (!order) return false;

    // Define which statuses can be cancelled
    const cancellableStatuses = ["pending", "confirmed", "processing"];
    return cancellableStatuses.includes(order.status);
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Get status color
  function getStatusColor(status) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  // Calculate progress bar width
  function getProgressWidth() {
    if (!order) return "w-1/4";

    switch (order.status) {
      case "pending":
        return "w-1/4";
      case "confirmed":
        return "w-2/5";
      case "processing":
        return "w-3/5";
      case "shipped":
        return "w-4/5";
      case "delivered":
        return "w-full";
      case "cancelled":
        return "w-1/4";
      default:
        return "w-1/4";
    }
  }

  // Get progress bar color
  function getProgressColor() {
    if (!order) return "bg-blue-500";

    switch (order.status) {
      case "pending":
      case "confirmed":
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-indigo-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {error || "Order not found"}
          </h1>
          <p className="text-gray-600 mb-8">
            We couldn't find the order you're looking for.
          </p>
          <div className="space-x-4">
            <Link
              href="/orders"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              View My Orders
            </Link>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = Number(order.summary?.subtotal || 0);
  const discount = Number(order.summary?.discount || 0);
  const shipping = subtotal > 500 ? 0 : 100;
  const finalTotal = subtotal + shipping - discount;

  // Generate WhatsApp message with order details
  const whatsappMessage = `Namaste! I want to make payment for my order.

📦 Order Number: ${order.orderNumber}
💰 Amount: रु ${finalTotal.toFixed(2)}
👤 Customer: ${order.shippingAddress?.full_name || order.shippingAddress?.name || "Customer"}
📱 Phone: ${order.shippingAddress?.phone_number || order.shippingAddress?.phone || "Not provided"}

Please share Khalti/eSewa payment details.`;

  const whatsappUrl = `https://wa.me/9779742304520?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header - Updated with icons and messages */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">
            {order.status === "cancelled"
              ? "❌"
              : order.status === "delivered"
                ? "🎁"
                : order.status === "shipped"
                  ? "🚚"
                  : order.status === "processing"
                    ? "⚙️"
                    : order.status === "confirmed"
                      ? "✅"
                      : "🎉"}
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {order.status === "cancelled"
              ? "Order Cancelled"
              : order.status === "delivered"
                ? "Order Delivered!"
                : order.status === "shipped"
                  ? "Order Shipped!"
                  : order.status === "processing"
                    ? "Order Processing!"
                    : order.status === "confirmed"
                      ? "Order Confirmed!"
                      : "Order Placed!"}
          </h1>
          <p className="text-xl opacity-90">
            {order.status === "cancelled"
              ? "This order has been cancelled."
              : order.status === "delivered"
                ? "Your order has been delivered successfully! Thank you for shopping with us."
                : order.status === "shipped"
                  ? "Your order has been shipped and is on its way to you."
                  : order.status === "processing"
                    ? "Your order is being processed and prepared for shipping."
                    : order.status === "confirmed"
                      ? "Your order has been confirmed and will be processed soon."
                      : "Thank you for your purchase. Your order is being processed."}
          </p>
          <div className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="font-mono font-bold text-lg tracking-wider">
              {order.orderNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cancel Order #{order.orderNumber}
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please tell us why you want to cancel this order..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={cancelling}
              />
              <p className="text-xs text-gray-500 mt-2">
                Note: Order can only be cancelled if status is Pending,
                Confirmed, or Processing.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setCancelReason("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={cancelling}
              >
                Go Back
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling || !cancelReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Cancelling...
                  </>
                ) : (
                  "Confirm Cancellation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Payment Section for Online Orders */}
      {order?.paymentMethod === "online" &&
        order?.paymentStatus === "pending" && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-y border-green-200">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-green-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">💬</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Complete Payment via WhatsApp
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Click the WhatsApp button to get payment details for
                        your order
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 hover:shadow-lg min-w-[200px]"
                    >
                      <span className="text-2xl">💬</span>
                      <div className="text-left">
                        <div className="text-lg">Pay via WhatsApp</div>
                        <div className="text-sm opacity-90">
                          Get payment details
                        </div>
                      </div>
                      <span className="ml-2">→</span>
                    </a>

                    <button
                      onClick={() => router.push(`/orders`)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                    >
                      <span>📋</span>
                      View My Orders
                    </button>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">
                    How to pay:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600">1</span>
                        <span className="font-medium">
                          Click WhatsApp button
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Message us with your order details
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600">2</span>
                        <span className="font-medium">Get payment details</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        We'll share Khalti/eSewa QR & details
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600">3</span>
                        <span className="font-medium">Send payment proof</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Send screenshot after payment
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Note */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 mt-0.5">📌</span>
                    <div>
                      <p className="font-medium text-yellow-800">
                        Important Note
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your order #{order.orderNumber} is reserved for{" "}
                        <strong>24 hours</strong>. Please complete payment to
                        confirm your order.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status Card - Updated with icons */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Status
                </h2>
                {canCancelOrder() && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                  >
                    <span>✕</span>
                    Cancel Order
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Order Status with package icon */}
                  <div
                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(order.status)}`}
                  >
                    <span className="text-sm">
                      {order.status === "pending"
                        ? "📦"
                        : order.status === "confirmed"
                          ? "✅"
                          : order.status === "processing"
                            ? "⚙️"
                            : order.status === "shipped"
                              ? "🚚"
                              : order.status === "delivered"
                                ? "🎁"
                                : order.status === "cancelled"
                                  ? "❌"
                                  : "📦"}
                    </span>
                    <span className="font-medium capitalize">
                      {order.status}
                    </span>
                  </div>

                  {/* Payment Status with money icon */}
                  <div
                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : order.paymentStatus === "refunded"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <span className="text-sm">
                      {order.paymentStatus === "paid"
                        ? "💰"
                        : order.paymentStatus === "failed"
                          ? "❌"
                          : order.paymentStatus === "refunded"
                            ? "💸"
                            : "💵"}
                    </span>
                    <span className="font-medium capitalize">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span
                    className={
                      order.status === "pending" ? "font-semibold" : ""
                    }
                  >
                    Order Placed
                  </span>
                  <span
                    className={
                      order.status === "confirmed" ? "font-semibold" : ""
                    }
                  >
                    Confirmed
                  </span>
                  <span
                    className={
                      order.status === "processing" ? "font-semibold" : ""
                    }
                  >
                    Processing
                  </span>
                  <span
                    className={
                      order.status === "shipped" ? "font-semibold" : ""
                    }
                  >
                    Shipped
                  </span>
                  <span
                    className={
                      order.status === "delivered" ? "font-semibold" : ""
                    }
                  >
                    Delivered
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressWidth()} ${getProgressColor()}`}
                  />
                </div>
              </div>

              {/* Cancellation Notice */}
              {order.status === "cancelled" && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-red-600">✕</span>
                    </div>
                    <div>
                      <p className="font-medium text-red-900">
                        Order Cancelled
                      </p>
                      <p className="text-red-700">
                        This order has been cancelled
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estimated Delivery */}
              {order.estimatedDelivery && order.status !== "cancelled" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600">📅</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">
                        Estimated Delivery
                      </p>
                      <p className="text-blue-700">
                        {formatDate(order.estimatedDelivery)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        रु {item.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        रु {item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Shipping Address - Updated for Nepal */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-3">
                  <p className="font-medium text-lg">
                    {order.shippingAddress?.full_name ||
                      order.shippingAddress?.name}
                  </p>
                  {order.shippingAddress?.phone_number && (
                    <p className="flex items-center gap-2 text-gray-700">
                      <span className="text-gray-500">📱</span>
                      <span>{order.shippingAddress.phone_number}</span>
                    </p>
                  )}
                  <p className="text-gray-700">
                    {order.shippingAddress?.address}
                  </p>
                  {order.shippingAddress?.district && (
                    <p className="text-gray-600">
                      {order.shippingAddress.district}, Nepal
                    </p>
                  )}
                  {order.shippingAddress?.email && (
                    <p className="text-gray-600">
                      {order.shippingAddress.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Payment Method
                </h2>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                    {order.paymentMethod === "online" ? (
                      <span className="text-xl">💳</span>
                    ) : order.paymentMethod === "cod" ? (
                      <span className="text-xl">💵</span>
                    ) : (
                      <span className="text-xl">💳</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : order.paymentMethod === "online"
                          ? "Online Payment"
                          : "Credit Card"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          order.paymentStatus === "paid"
                            ? "text-green-600"
                            : order.paymentStatus === "failed"
                              ? "text-red-600"
                              : order.paymentStatus === "refunded"
                                ? "text-gray-600"
                                : "text-yellow-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </p>
                    {order.paymentMethod === "online" &&
                      order.paymentStatus === "pending" && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Payment details sent via WhatsApp
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">रु {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">रु {shipping.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -रु {discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>रु {finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-4">
                {canCancelOrder() && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="block w-full bg-red-600 text-white text-center py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <span>✕</span>
                    Cancel Order
                  </button>
                )}

                <Link
                  href="/orders"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  View All Orders
                </Link>

                <Link
                  href="/shop"
                  className="block w-full border-2 border-gray-300 text-gray-700 text-center py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Continue Shopping
                </Link>

                <button
                  onClick={() => window.print()}
                  className="block w-full border-2 border-gray-300 text-gray-700 text-center py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Print Receipt
                </button>
              </div>

              {/* Help Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Need Help?</h3>
                <div className="space-y-2">
                  <a
                    href="https://wa.me/9779742304520"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-green-600 hover:text-green-800"
                  >
                    <span className="mr-2">💬</span>
                    WhatsApp Support
                  </a>
                  <Link
                    href="/contact"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <span className="mr-2">📞</span>
                    Contact Support
                  </Link>
                </div>
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Order Notes
                  </h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
