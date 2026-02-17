// app/admin/users/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "@/app/_lib/actions/admin-actions";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [updating, setUpdating] = useState({});
  const [deleting, setDeleting] = useState({});
  const [searchInput, setSearchInput] = useState("");

  const itemsPerPage = 20;

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      const offset = (currentPage - 1) * itemsPerPage;
      const result = await getAllUsers(itemsPerPage, offset, searchTerm);

      if (result.success) {
        setUsers(result.users);
        setTotalUsers(result.totalCount || 0);
      } else {
        setError(result.error || "Failed to load users");
        if (result.error === "Unauthorized") {
          router.push("/");
        }
      }
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    if (!confirm(`Change user role to ${newRole}?`)) return;

    try {
      setUpdating((prev) => ({ ...prev, [userId]: true }));
      const result = await updateUserRole(userId, newRole);

      if (result.success) {
        await loadUsers(); // Refresh the list
      } else {
        alert(`Failed to update role: ${result.error}`);
      }
    } catch (err) {
      alert("Error updating user role");
    } finally {
      setUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  }

  async function handleDeleteUser(userId, userEmail) {
    if (
      !confirm(
        `Are you sure you want to delete user ${userEmail}? This action cannot be undone.`,
      )
    )
      return;

    try {
      setDeleting((prev) => ({ ...prev, [userId]: true }));
      const result = await deleteUser(userId);

      if (result.success) {
        await loadUsers(); // Refresh the list
      } else {
        alert(`Failed to delete user: ${result.error}`);
      }
    } catch (err) {
      alert("Error deleting user");
    } finally {
      setDeleting((prev) => ({ ...prev, [userId]: false }));
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset to first page when searching
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getDaysAgo(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Users Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all registered users ({totalUsers} total)
              </p>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by email, name, or phone..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[250px]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Admins</p>
            <p className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.role === "admin").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Customers</p>
            <p className="text-2xl font-bold text-blue-600">
              {users.filter((u) => u.role === "customer").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Active Users</p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.is_active).length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <div className="text-gray-600">Loading users...</div>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">
              <p className="text-lg font-medium">{error}</p>
              <button
                onClick={loadUsers}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm mt-2">
                {searchTerm
                  ? "Try a different search term"
                  : "No users have registered yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name || "User"}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <span className="text-blue-600 font-medium">
                                {user.name?.charAt(0) ||
                                  user.email?.charAt(0) ||
                                  "U"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name || "No name"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">{user.email}</p>
                          {user.phone && (
                            <p className="text-sm text-gray-600">
                              📱 {user.phone}
                            </p>
                          )}
                          {user.address && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {user.address}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value)
                            }
                            disabled={updating[user.id]}
                            className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
                            ></span>
                            <span className="text-xs text-gray-600">
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">
                            {formatDate(user.created_at)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getDaysAgo(user.created_at)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Last updated: {formatDate(user.updated_at)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/admin/orders?userId=${user.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Orders
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteUser(user.id, user.email)
                            }
                            disabled={
                              deleting[user.id] || user.role === "admin"
                            }
                            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              user.role === "admin"
                                ? "Cannot delete admin users"
                                : "Delete user"
                            }
                          >
                            {deleting[user.id] ? "Deleting..." : "Delete User"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • Showing {users.length} of{" "}
              {totalUsers} users
            </div>
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
                disabled={currentPage >= totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-bold text-yellow-900 mb-3">⚠️ Important Notes</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                Admin users cannot be deleted (must be demoted to customer
                first)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Users with existing orders cannot be deleted</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                Use search to find users by email, name, or phone number
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Only assign admin role to trusted users</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
