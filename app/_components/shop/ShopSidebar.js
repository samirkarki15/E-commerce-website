// components/shop/ShopSidebar.js
"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ShopSidebar({
  categories = [],
  brands = [],
  priceRange = { min: 0, max: 1000 },
  selectedCategory = "",
  selectedBrand = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mobile filter toggle
  const [isOpen, setIsOpen] = useState(false);

  // Safe values
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeBrands = Array.isArray(brands) ? brands : [];
  const rangeMin = Number(priceRange?.min) || 0;
  const rangeMax = Number(priceRange?.max) || 1000;

  // Read current price filters from URL (source of truth)
  const urlMin = searchParams?.get("minPrice");
  const urlMax = searchParams?.get("maxPrice");
  const currentMin = urlMin !== null ? Number(urlMin) : rangeMin;
  const currentMax = urlMax !== null ? Number(urlMax) : rangeMax;

  // Local slider state — initialized from URL or range defaults
  const [sliderMin, setSliderMin] = useState(currentMin);
  const [sliderMax, setSliderMax] = useState(currentMax);
  // Track previous URL values to detect external changes (clear, back button, etc.)
  const [prevUrlMin, setPrevUrlMin] = useState(urlMin);
  const [prevUrlMax, setPrevUrlMax] = useState(urlMax);

  // Sync sliders when URL changes externally (not from slider interaction)
  if (urlMin !== prevUrlMin || urlMax !== prevUrlMax) {
    setPrevUrlMin(urlMin);
    setPrevUrlMax(urlMax);
    const newMin = urlMin !== null ? Number(urlMin) : rangeMin;
    const newMax = urlMax !== null ? Number(urlMax) : rangeMax;
    if (sliderMin !== newMin) setSliderMin(newMin);
    if (sliderMax !== newMax) setSliderMax(newMax);
  }

  // Navigate with updated params
  const pushParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Apply price filter to URL
  const applyPriceFilter = useCallback(
    (min, max) => {
      const updates = {};
      // Only add to URL if different from range defaults
      updates.minPrice = min > rangeMin ? min : null;
      updates.maxPrice = max < rangeMax ? max : null;
      pushParams(updates);
    },
    [pushParams, rangeMin, rangeMax],
  );

  // Update a single filter (category/brand)
  const updateFilter = (key, value) => {
    pushParams({ [key]: value || null });
  };

  // Clear all filters
  const clearFilters = () => {
    setSliderMin(rangeMin);
    setSliderMax(rangeMax);
    router.push("/shop");
  };

  // Active filter checks
  const hasPriceFilter = currentMin > rangeMin || currentMax < rangeMax;
  const hasActiveFilters = selectedCategory || selectedBrand || hasPriceFilter;
  const activeFilterCount = [
    selectedCategory,
    selectedBrand,
    hasPriceFilter ? "price" : null,
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

      {/* Sidebar Content */}
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

        {/* Categories */}
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
              {safeCategories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 sm:p-2 rounded"
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={() => {
                      updateFilter("category", cat);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 cursor-pointer"
                  />
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700 capitalize">
                    {cat}
                  </span>
                  {selectedCategory === cat && (
                    <span className="ml-auto text-blue-600 font-bold text-xs sm:text-sm">
                      ✓
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Brands */}
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
              {safeBrands.map((b) => (
                <label
                  key={b}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-1.5 sm:p-2 rounded"
                >
                  <input
                    type="radio"
                    name="brand"
                    value={b}
                    checked={selectedBrand === b}
                    onChange={() => {
                      updateFilter("brand", b);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 cursor-pointer"
                  />
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700">
                    {b}
                  </span>
                  {selectedBrand === b && (
                    <span className="ml-auto text-blue-600 font-bold text-xs sm:text-sm">
                      ✓
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div data-price-slider>
          <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
            Price Range
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {/* Display current values */}
            <div className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                रु {sliderMin}
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                रु {sliderMax}
              </span>
            </div>

            {/* Min slider */}
            <div>
              <label className="text-xs text-gray-600 block mb-1 sm:mb-2">
                Minimum Price
              </label>
              <input
                type="range"
                min={rangeMin}
                max={rangeMax}
                value={sliderMin}
                step={1}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= sliderMax) setSliderMin(val);
                }}
                onMouseUp={(e) => applyPriceFilter(Number(e.currentTarget.value), sliderMax)}
                onTouchEnd={(e) => applyPriceFilter(Number(e.currentTarget.value), sliderMax)}
                className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Max slider */}
            <div>
              <label className="text-xs text-gray-600 block mb-1 sm:mb-2">
                Maximum Price
              </label>
              <input
                type="range"
                min={rangeMin}
                max={rangeMax}
                value={sliderMax}
                step={1}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= sliderMin) setSliderMax(val);
                }}
                onMouseUp={(e) => applyPriceFilter(sliderMin, Number(e.currentTarget.value))}
                onTouchEnd={(e) => applyPriceFilter(sliderMin, Number(e.currentTarget.value))}
                className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Number inputs */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Min</label>
                <input
                  type="number"
                  min={rangeMin}
                  max={rangeMax}
                  value={sliderMin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val) && val >= rangeMin && val <= sliderMax) {
                      setSliderMin(val);
                    }
                  }}
                  onBlur={() => applyPriceFilter(sliderMin, sliderMax)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyPriceFilter(sliderMin, sliderMax);
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Max</label>
                <input
                  type="number"
                  min={rangeMin}
                  max={rangeMax}
                  value={sliderMax}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val) && val >= sliderMin && val <= rangeMax) {
                      setSliderMax(val);
                    }
                  }}
                  onBlur={() => applyPriceFilter(sliderMin, sliderMax)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyPriceFilter(sliderMin, sliderMax);
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
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
              {hasPriceFilter && (
                <div className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-purple-100 text-purple-800">
                  <span>
                    रु {currentMin} - रु {currentMax}
                  </span>
                  <button
                    onClick={() => {
                      setSliderMin(rangeMin);
                      setSliderMax(rangeMax);
                      pushParams({ minPrice: null, maxPrice: null });
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
