// app/admin/products/page.js
import { getAdminProducts } from "@/app/_lib/actions/product-actions";
import Link from "next/link";
import ProductTable from "@/app/_components/admin/ProductTable";
import { auth } from "@/app/_lib/auth";
import { redirect } from "next/navigation";

export default async function ProductsPage({ searchParams }) {
  // Check if user is authenticated and is admin
  const session = await auth();

  if (!session) {
    // Not logged in - redirect to sign in
    redirect("/auth/signin");
  }

  if (session.user?.role !== "admin") {
    // Not admin - redirect to home
    redirect("/");
  }

  // WAIT for searchParams promise to resolve
  const params = await searchParams;

  // Safely extract search params with defaults
  const search = params?.search || "";
  const category = params?.category || "";
  const page = parseInt(params?.page) || 1;

  // Validate page number
  const currentPage = isNaN(page) || page < 1 ? 1 : page;

  // Fetch products with safe parameters
  const {
    products = [],
    total = 0,
    page: fetchedPage = currentPage,
    totalPages = 1,
  } = await getAdminProducts({
    search: search,
    category: category,
    page: currentPage,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Products Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your product catalog ({total} total products)
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <span className="text-xl">+</span>
              <span>Add New Product</span>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Search & Filters
          </h2>
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="search"
                placeholder="Search by product name, SKU, or description..."
                defaultValue={search}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                name="category"
                defaultValue={category}
                className="w-full md:w-48 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Living</option>
                <option value="beauty">Beauty & Health</option>
                <option value="sports">Sports & Outdoors</option>
                <option value="books">Books & Media</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow hover:shadow-lg transition-all"
              >
                Search
              </button>
              {(search || category) && (
                <Link
                  href="/admin/products"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <span className="text-2xl text-blue-600">📦</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{total}</h3>
            <p className="text-gray-600 mt-2">Total Products</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <span className="text-2xl text-green-600">✅</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {products.filter((p) => p.is_published).length}
            </h3>
            <p className="text-gray-600 mt-2">Published</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <span className="text-2xl text-red-600">⚠️</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {products.filter((p) => (p.quantity || 0) === 0).length}
            </h3>
            <p className="text-gray-600 mt-2">Out of Stock</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Products ({products.length})
            </h2>
          </div>
          <ProductTable products={products} />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing page {fetchedPage} of {totalPages} • {products.length}{" "}
                products
              </div>
              <div className="flex gap-2">
                {fetchedPage > 1 && (
                  <Link
                    href={`/admin/products?page=${fetchedPage - 1}&search=${search}&category=${category}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}

                <div className="flex gap-1">
                  {/* Show first page */}
                  {fetchedPage > 2 && (
                    <Link
                      href={`/admin/products?page=1&search=${search}&category=${category}`}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      1
                    </Link>
                  )}

                  {/* Show dots if needed */}
                  {fetchedPage > 3 && <span className="px-3 py-2">...</span>}

                  {/* Show current page and neighbors */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (fetchedPage <= 3) {
                      pageNum = i + 1;
                    } else if (fetchedPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = fetchedPage - 2 + i;
                    }

                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <Link
                        key={pageNum}
                        href={`/admin/products?page=${pageNum}&search=${search}&category=${category}`}
                        className={`px-3 py-2 rounded-lg ${
                          pageNum === fetchedPage
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}

                  {/* Show dots if needed */}
                  {fetchedPage < totalPages - 2 && (
                    <span className="px-3 py-2">...</span>
                  )}

                  {/* Show last page */}
                  {fetchedPage < totalPages - 1 && (
                    <Link
                      href={`/admin/products?page=${totalPages}&search=${search}&category=${category}`}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      {totalPages}
                    </Link>
                  )}
                </div>

                {fetchedPage < totalPages && (
                  <Link
                    href={`/admin/products?page=${fetchedPage + 1}&search=${search}&category=${category}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {products.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              {search || category
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            <Link
              href="/admin/products/new"
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium shadow hover:shadow-lg transition-all"
            >
              Add New Product
            </Link>
          </div>
        )}

        {/* Footer Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
