"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchSort({
  search = "",
  sortBy = "created_at",
  totalProducts = 0,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(search);
  const [currentSort, setCurrentSort] = useState(sortBy);

  // Update local state when props change
  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  useEffect(() => {
    setCurrentSort(sortBy);
  }, [sortBy]);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || "");

    if (searchTerm && searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }

    // Reset to page 1 when searching
    params.delete("page");

    console.log("Search params:", params.toString());
    router.push(`/shop?${params.toString()}`);
  };

  const handleSort = (value) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("sortBy", value);
    params.delete("page"); // Reset to page 1 when sorting

    console.log("Sort params:", params.toString());
    router.push(`/shop?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("search");
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{totalProducts}</span>{" "}
          {totalProducts === 1 ? "product" : "products"}
        </div>

        {/* Search Bar with Button */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {/* Search Icon */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                🔍
              </div>

              {/* Clear Button */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Search Button - Visible on both mobile and desktop */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">🔍</span>
            </button>
          </div>
        </form>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Sort by:
          </span>
          <select
            value={currentSort}
            onChange={(e) => handleSort(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="created_at">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}
