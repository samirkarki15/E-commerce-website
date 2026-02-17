// app/admin/orders/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getAdminOrderDetail,
  updateAdminOrderStatus,
  adminCancelOrder,
  adminRefundOrder,
} from "@/app/_lib/actions/admin-actions";

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Cancellation/Refund states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-sky-100 text-sky-800 border-sky-300",
    processing: "bg-purple-100 text-purple-800 border-purple-300",
    shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
    delivered: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
    refunded: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const paymentColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    paid: "bg-green-100 text-green-800 border-green-300",
    failed: "bg-red-100 text-red-800 border-red-300",
    refunded: "bg-gray-100 text-gray-800 border-gray-300",
  };

  // Check if order can be cancelled
  function canCancelOrder() {
    if (!order) return false;
    const cancellableStatuses = ["pending", "confirmed", "processing"];
    return cancellableStatuses.includes(order.status);
  }

  // Check if order can be refunded
  function canRefundOrder() {
    if (!order) return false;
    return order.paymentStatus === "paid" && order.status !== "refunded";
  }

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  async function loadOrder() {
    if (!orderId) {
      setError("Order ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getAdminOrderDetail(orderId);

      if (result.success) {
        setOrder(result.order);
        // Set refund amount to total amount by default
        if (result.order.totalAmount) {
          setRefundAmount(result.order.totalAmount.toFixed(2));
        }
      } else {
        setError(result.error || "Failed to load order");
        if (result.error === "Unauthorized") {
          setTimeout(() => router.push("/"), 1000);
        }
      }
    } catch (err) {
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus) {
    if (!order) return;

    try {
      setUpdatingStatus(true);
      const result = await updateAdminOrderStatus(order.id, newStatus);

      if (result.success) {
        await loadOrder();
        setActionMessage(`Order status updated to ${newStatus}`);
        setTimeout(() => setActionMessage(""), 3000);
      } else {
        alert(`Failed to update status: ${result.error}`);
      }
    } catch (error) {
      alert("Error updating order status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handlePaymentStatusChange(newPaymentStatus) {
    if (!order) return;

    try {
      setUpdatingPayment(true);
      const result = await updateAdminOrderStatus(
        order.id,
        order.status,
        newPaymentStatus,
      );

      if (result.success) {
        await loadOrder();
        setActionMessage(`Payment status updated to ${newPaymentStatus}`);
        setTimeout(() => setActionMessage(""), 3000);
      } else {
        alert(`Failed to update payment status: ${result.error}`);
      }
    } catch (error) {
      alert("Error updating payment status");
    } finally {
      setUpdatingPayment(false);
    }
  }

  async function handleCancelOrder() {
    if (!order || !cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    try {
      setActionLoading(true);
      const result = await adminCancelOrder(order.id, cancelReason, true);

      if (result.success) {
        setActionMessage("Order cancelled successfully");
        await loadOrder();
        setShowCancelModal(false);
        setCancelReason("");
      } else {
        alert(`Failed to cancel order: ${result.error}`);
      }
    } catch (err) {
      alert("Error cancelling order");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRefundOrder() {
    if (!order || !refundReason.trim()) {
      alert("Please provide a refund reason");
      return;
    }

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid refund amount");
      return;
    }

    try {
      setActionLoading(true);
      const result = await adminRefundOrder(order.id, amount, refundReason);

      if (result.success) {
        setActionMessage(`Refund of रु ${amount} processed successfully`);
        await loadOrder();
        setShowRefundModal(false);
        setRefundReason("");
        setRefundAmount(order.totalAmount.toFixed(2));
      } else {
        alert(`Failed to process refund: ${result.error}`);
      }
    } catch (err) {
      alert("Error processing refund");
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Cancel Modal Component
  const CancelModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Cancel Order #{order?.orderNumber}
        </h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to cancel this order? This action will restore
          product stock and notify the customer.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for cancellation *
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter cancellation reason..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            disabled={actionLoading}
          />
          <p className="text-xs text-gray-500 mt-2">
            This reason will be recorded and may be shared with the customer.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setShowCancelModal(false);
              setCancelReason("");
            }}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            disabled={actionLoading}
          >
            Go Back
          </button>
          <button
            onClick={handleCancelOrder}
            disabled={actionLoading || !cancelReason.trim()}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? (
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
  );

  // Refund Modal Component
  const RefundModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Refund Order #{order?.orderNumber}
        </h3>
        <p className="text-gray-600 mb-6">
          Process a refund for this paid order. The order status will be changed
          to "refunded" and product stock will be restored.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Amount (रु) *
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              min="0"
              step="0.01"
              max={order?.totalAmount}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={actionLoading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Order total: रु {order?.totalAmount?.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for refund *
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Enter refund reason..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={actionLoading}
            />
            <p className="text-xs text-gray-500 mt-2">
              This reason will be recorded in the order notes.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setShowRefundModal(false);
              setRefundReason("");
            }}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleRefundOrder}
            disabled={actionLoading || !refundReason.trim() || !refundAmount}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                Processing...
              </>
            ) : (
              "Process Refund"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href="/admin/orders"
              className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2"
            >
              ← Back to Orders
            </Link>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href="/admin/orders"
              className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2"
            >
              ← Back to Orders
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2">Error Loading Order</h2>
            <p className="mb-4">{error}</p>
            <Link
              href="/admin/orders"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const customer = order?.shippingAddress || {};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Modals */}
      {showCancelModal && <CancelModal />}
      {showRefundModal && <RefundModal />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/orders"
              className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center gap-2"
            >
              ← Back to Orders
            </Link>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Order #{order?.orderNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order?.status] || "bg-gray-100"}`}
              >
                {order?.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(order?.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Action Buttons */}
            {canCancelOrder() && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 flex items-center gap-2 font-medium"
              >
                <span>✕</span>
                Cancel Order
              </button>
            )}

            {canRefundOrder() && (
              <button
                onClick={() => setShowRefundModal(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 flex items-center gap-2 font-medium"
              >
                <span>💸</span>
                Refund Order
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <span>🖨️</span>
              Print
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <span>📧</span>
              Email Customer
            </button>
          </div>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>{actionMessage}</span>
            </div>
          </div>
        )}

        {/* Status Update Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Order Status Update */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Update Order Status
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
                "refunded",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={updatingStatus || order?.status === status}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    order?.status === status
                      ? `${statusColors[status]} border-2`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${updatingStatus ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {status}
                  {order?.status === status && " ✓"}
                </button>
              ))}
            </div>
            {updatingStatus && (
              <p className="text-sm text-gray-500 mt-3">Updating status...</p>
            )}
          </div>

          {/* Payment Status Update */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Update Payment Status
            </h2>
            <div className="flex flex-wrap gap-2">
              {["pending", "paid", "failed", "refunded"].map(
                (paymentStatus) => (
                  <button
                    key={paymentStatus}
                    onClick={() => handlePaymentStatusChange(paymentStatus)}
                    disabled={
                      updatingPayment || order?.paymentStatus === paymentStatus
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                      order?.paymentStatus === paymentStatus
                        ? `${paymentColors[paymentStatus]} border-2`
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } ${updatingPayment ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {paymentStatus}
                    {order?.paymentStatus === paymentStatus && " ✓"}
                  </button>
                ),
              )}
            </div>
            {updatingPayment && (
              <p className="text-sm text-gray-500 mt-3">
                Updating payment status...
              </p>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Items ({order?.itemCount})
                </h2>
              </div>
              <div className="divide-y">
                {order?.items?.map((item) => (
                  <div key={item.id} className="p-6 flex items-start gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        SKU: {item.sku}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        <span>×</span>
                        <span>रु {item.unitPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        रु {item.totalPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Total</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Contact Details
                  </h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500">👤</span>
                      <span>{customer.full_name || order?.userName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-gray-500">📧</span>
                      <span>{order?.userEmail}</span>
                    </p>
                    {customer.phone_number && (
                      <p className="flex items-center gap-2">
                        <span className="text-gray-500">📱</span>
                        <span>{customer.phone_number}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Order Details
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Payment Method:</span>{" "}
                      <span className="font-medium capitalize">
                        {order?.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : order?.paymentMethod === "online"
                            ? "Online Payment"
                            : order?.paymentMethod || "N/A"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Payment Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${paymentColors[order?.paymentStatus] || "bg-gray-100"}`}
                      >
                        {order?.paymentStatus?.toUpperCase()}
                      </span>
                    </p>
                    {order?.estimatedDelivery && (
                      <p>
                        <span className="text-gray-600">
                          Estimated Delivery:
                        </span>{" "}
                        <span className="font-medium">
                          {formatDate(order.estimatedDelivery)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Addresses */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    रु {order?.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    रु {order?.shippingAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    रु {order?.taxAmount.toFixed(2)}
                  </span>
                </div>
                {order?.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -रु {order?.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">
                      रु {order?.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🚚</span>
                Shipping Address
              </h2>
              <div className="space-y-2 text-gray-700">
                {order?.shippingAddress ? (
                  <>
                    <p className="font-medium">{customer.full_name}</p>
                    {customer.phone_number && (
                      <p className="text-sm">📱 {customer.phone_number}</p>
                    )}
                    <p className="text-sm mt-2">{customer.address}</p>
                    <p className="text-sm">
                      {customer.district && `${customer.district}, `}
                      {customer.city && `${customer.city} `}
                      {customer.zip && customer.zip}
                    </p>
                    {customer.country && (
                      <p className="text-sm">{customer.country}</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic">
                    No shipping address provided
                  </p>
                )}
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💳</span>
                Billing Address
              </h2>
              <div className="space-y-2 text-gray-700">
                {order?.billingAddress ? (
                  <>
                    <p className="font-medium">
                      {order.billingAddress.full_name ||
                        order.billingAddress.name}
                    </p>
                    {order.billingAddress.phone_number && (
                      <p className="text-sm">
                        📱 {order.billingAddress.phone_number}
                      </p>
                    )}
                    <p className="text-sm mt-2">
                      {order.billingAddress.address}
                    </p>
                    <p className="text-sm">
                      {order.billingAddress.district &&
                        `${order.billingAddress.district}, `}
                      {order.billingAddress.city &&
                        `${order.billingAddress.city} `}
                      {order.billingAddress.zip && order.billingAddress.zip}
                    </p>
                  </>
                ) : order?.shippingAddress ? (
                  <p className="text-gray-500 italic">
                    Same as shipping address
                  </p>
                ) : (
                  <p className="text-gray-500 italic">
                    No billing address provided
                  </p>
                )}
              </div>
            </div>

            {/* Order Notes */}
            {order?.notes && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📝</span>
                  Order Notes
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order?.createdAt)}
                    </p>
                  </div>
                </div>
                {order?.estimatedDelivery && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">📅</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Estimated Delivery
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.estimatedDelivery)}
                      </p>
                    </div>
                  </div>
                )}
                {order?.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">🎁</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Delivered</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.deliveredAt)}
                      </p>
                    </div>
                  </div>
                )}
                {order?.cancelledAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Cancelled</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.cancelledAt)}
                      </p>
                      {order.cancellationReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {order.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {order?.refundedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-sm">💸</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Refunded</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.refundedAt)}
                      </p>
                      {order.refundAmount && (
                        <p className="text-xs text-gray-600 mt-1">
                          Amount: रु {order.refundAmount}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
