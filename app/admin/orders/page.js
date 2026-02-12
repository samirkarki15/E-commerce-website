"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  isAdmin,
} from "@/app/_lib/actions/admin-actions";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const itemsPerPage = 10;
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-sky-100 text-sky-800", // Sky blue (lighter)
    processing: "bg-purple-100 text-purple-800", // Purple
    shipped: "bg-indigo-100 text-indigo-800", // Indigo (darker blue)
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  const paymentColors = {
    pending: "bg-yellow-50 text-yellow-700",
    paid: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-700",
  };

  // Check if user is admin on component mount
  useEffect(() => {
    async function checkAdmin() {
      try {
        const adminCheck = await isAdmin();
        setIsAdminUser(adminCheck);

        if (!adminCheck) {
          // Redirect non-admin users immediately
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    }

    checkAdmin();
  }, [router]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const result = await getAdminOrders(itemsPerPage, offset);

      if (result.success) {
        setOrders(result.orders);
      } else {
        console.error("Error loading orders:", result.error);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    // Only load orders if user is admin
    if (isAdminUser) {
      loadOrders();
    }
  }, [loadOrders, isAdminUser]);

  async function handleStatusChange(orderId, newStatus) {
    try {
      setUpdating((prev) => ({ ...prev, [orderId]: true }));
      const result = await updateAdminOrderStatus(orderId, newStatus);

      if (result.success) {
        await loadOrders();
      } else {
        console.error("Error updating order:", result.error);
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order");
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  async function handlePaymentStatusChange(orderId, newPaymentStatus) {
    try {
      setUpdating((prev) => ({ ...prev, [orderId]: true }));
      const order = orders.find((o) => o.id === orderId);
      const currentStatus = order?.status || "pending";

      console.log(
        `Changing payment status for order ${orderId} to ${newPaymentStatus}`,
      );

      const result = await updateAdminOrderStatus(
        orderId,
        currentStatus,
        newPaymentStatus,
      );

      console.log("Update result:", result);

      if (result.success) {
        console.log("Payment status updated successfully");
        await loadOrders();
      } else {
        console.error("Error updating payment status:", result.error);
        alert(`Failed to update payment status: ${result.error}`);
      }
    } catch (error) {
      console.error("Exception updating payment status:", error);
      alert(
        `Error updating payment status: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Helper function to extract customer info from shipping address
  function getCustomerInfo(order) {
    // Try to get info from shipping_address JSON
    if (order.shippingAddress) {
      return {
        fullName:
          order.shippingAddress.full_name ||
          order.shippingAddress.name ||
          "N/A",
        phone:
          order.shippingAddress.phone_number ||
          order.shippingAddress.phone ||
          "N/A",
        address: order.shippingAddress.address || "N/A",
        district: order.shippingAddress.district || "N/A",
      };
    }

    // Fallback to user table data
    return {
      fullName: order.userName || "N/A",
      phone: "N/A",
      address: "N/A",
      district: "N/A",
    };
  }

  // Don't render anything if not admin (redirect will happen)
  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-2">
          Manage and track all customer orders
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
            <div className="text-gray-600">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm mt-2">There are no orders to display yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Customer Details
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => {
                  const customer = getCustomerInfo(order);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.fullName}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <span>📱</span>
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                          {customer.address !== "N/A" && (
                            <div className="text-xs text-gray-500 mt-1">
                              <div className="truncate max-w-xs">
                                {customer.address}
                              </div>
                              {customer.district !== "N/A" && (
                                <div className="text-gray-400 mt-0.5">
                                  {customer.district}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(order.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.itemCount}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        रु {order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          disabled={updating[order.id]}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${
                            statusColors[order.status] ||
                            "bg-gray-100 text-gray-800"
                          } cursor-pointer`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>{" "}
                          {/* Added this */}
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handlePaymentStatusChange(order.id, e.target.value)
                          }
                          disabled={updating[order.id]}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${
                            paymentColors[order.paymentStatus] ||
                            "bg-gray-100 text-gray-800"
                          } cursor-pointer`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">Page {currentPage}</div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={orders.length < itemsPerPage}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
