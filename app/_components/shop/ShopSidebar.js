// components/shop/ShopSidebar.js - SIMPLE MOBILE COLLAPSE
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ShopSidebar({
  categories = [],
  brands = [],
  priceRange = { min: 0, max: 1000 },
  selectedCategory = "",
  selectedBrand = "",
  selectedMinPrice = 0,
  selectedMaxPrice = 0,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for mobile filter collapse
  const [isOpen, setIsOpen] = useState(false);

  // State for price range
  const [price, setPrice] = useState({
    min: selectedMinPrice || priceRange?.min || 0,
    max: selectedMaxPrice || priceRange?.max || 1000,
  });

  // Update price state when props change
  useEffect(() => {
    setPrice({
      min: selectedMinPrice || priceRange?.min || 0,
      max: selectedMaxPrice || priceRange?.max || 1000,
    });
  }, [selectedMinPrice, selectedMaxPrice, priceRange]);

  // Update filter and preserve other params
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  // Update price filter
  const updatePriceFilter = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("minPrice", price.min.toString());
    params.set("maxPrice", price.max.toString());
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setPrice({
      min: priceRange?.min || 0,
      max: priceRange?.max || 1000,
    });
    router.push("/shop");
  };

  // Safe arrays
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeBrands = Array.isArray(brands) ? brands : [];
  const safePriceRange = priceRange || { min: 0, max: 1000 };

  // Check active filters
  const hasActiveFilters =
    selectedCategory ||
    selectedBrand ||
    (selectedMinPrice && selectedMinPrice > safePriceRange.min) ||
    (selectedMaxPrice && selectedMaxPrice < safePriceRange.max);

  // Count active filters
  const activeFilterCount = [
    selectedCategory,
    selectedBrand,
    (selectedMinPrice && selectedMinPrice > safePriceRange.min) ||
    (selectedMaxPrice && selectedMaxPrice < safePriceRange.max)
      ? "price"
      : null,
  ].filter(Boolean).length;

  return (
    <div className="lg:w-full">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-white rounded-lg shadow px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar Content - Collapsible on Mobile */}
      <div
        className={`
        bg-white rounded-lg shadow p-4 sm:p-6 space-y-4 sm:space-y-6
        lg:block lg:relative
        ${isOpen ? "block" : "hidden lg:block"}
      `}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Categories Section */}
        {safeCategories.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
              Categories
            </h3>
            <div className="space-y-1 sm:space-y-2 max-h-[300px] overflow-y-auto">
              <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 sm:p-2 rounded">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={!selectedCategory}
                  onChange={() => {
                    updateFilter("category", "");
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 cursor-pointer"
                />
                <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700">
                  All Categories
                </span>
              </label>
              {safeCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 sm:p-2 rounded"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={() => {
                      updateFilter("category", category);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 cursor-pointer"
                  />
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700 capitalize">
                    {category}
                  </span>
                  {selectedCategory === category && (
                    <span className="ml-auto text-blue-600 font-bold text-xs sm:text-sm">
                      ✓
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Brands Section */}
        {safeBrands.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
              Brands
            </h3>
            <div className="space-y-1 sm:space-y-2 max-h-[300px] overflow-y-auto">
              <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 sm:p-2 rounded">
                <input
                  type="radio"
                  name="brand"
                  value=""
                  checked={!selectedBrand}
                  onChange={() => {
                    updateFilter("brand", "");
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 cursor-pointer"
                />
                <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700">
                  All Brands
                </span>
              </label>
              {safeBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 sm:p-2 rounded"
                >
                  <input
                    type="radio"
                    name="brand"
                    value={brand}
                    checked={selectedBrand === brand}
                    onChange={() => {
                      updateFilter("brand", brand);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 cursor-pointer"
                  />
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700">
                    {brand}
                  </span>
                  {selectedBrand === brand && (
                    <span className="ml-auto text-blue-600 font-bold text-xs sm:text-sm">
                      ✓
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Range Section */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
            Price Range
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                रु {price.min}
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                रु {price.max}
              </span>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1 sm:mb-2">
                Minimum Price
              </label>
              <input
                type="range"
                min={safePriceRange.min}
                max={safePriceRange.max}
                value={price.min}
                onChange={(e) => {
                  const newMin = parseInt(e.target.value);
                  if (newMin <= price.max) setPrice({ ...price, min: newMin });
                }}
                onMouseUp={updatePriceFilter}
                onTouchEnd={updatePriceFilter}
                className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1 sm:mb-2">
                Maximum Price
              </label>
              <input
                type="range"
                min={safePriceRange.min}
                max={safePriceRange.max}
                value={price.max}
                onChange={(e) => {
                  const newMax = parseInt(e.target.value);
                  if (newMax >= price.min) setPrice({ ...price, max: newMax });
                }}
                onMouseUp={updatePriceFilter}
                onTouchEnd={updatePriceFilter}
                className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Min</label>
                <input
                  type="number"
                  min={safePriceRange.min}
                  max={safePriceRange.max}
                  value={price.min}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || safePriceRange.min;
                    if (val <= price.max) setPrice({ ...price, min: val });
                  }}
                  onBlur={updatePriceFilter}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Max</label>
                <input
                  type="number"
                  min={safePriceRange.min}
                  max={safePriceRange.max}
                  value={price.max}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || safePriceRange.max;
                    if (val >= price.min) setPrice({ ...price, max: val });
                  }}
                  onBlur={updatePriceFilter}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-3 sm:pt-4 border-t">
            <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
              Active Filters
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {selectedCategory && (
                <div className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800">
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {selectedCategory}
                  </span>
                  <button
                    onClick={() => updateFilter("category", "")}
                    className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800 font-bold text-sm"
                  >
                    ×
                  </button>
                </div>
              )}
              {selectedBrand && (
                <div className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800">
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {selectedBrand}
                  </span>
                  <button
                    onClick={() => updateFilter("brand", "")}
                    className="ml-1 sm:ml-2 text-green-600 hover:text-green-800 font-bold text-sm"
                  >
                    ×
                  </button>
                </div>
              )}
              {(selectedMinPrice > safePriceRange.min ||
                selectedMaxPrice < safePriceRange.max) && (
                <div className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-purple-100 text-purple-800">
                  <span>
                    रु {selectedMinPrice} - रु {selectedMaxPrice}
                  </span>
                  <button
                    onClick={() => {
                      updateFilter("minPrice", "");
                      updateFilter("maxPrice", "");
                      setPrice({
                        min: safePriceRange.min,
                        max: safePriceRange.max,
                      });
                    }}
                    className="ml-1 sm:ml-2 text-purple-600 hover:text-purple-800 font-bold text-sm"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
