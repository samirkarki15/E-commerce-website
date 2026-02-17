// app/shop/page.js
import {
  getShopProducts,
  getCategories,
  getBrands,
  getPriceRange,
} from "@/app/_lib/actions/shop-actions";
import ShopSidebar from "@/app/_components/shop/ShopSidebar";
import ProductGrid from "@/app/_components/shop/ProductGrid";
import SearchSort from "@/app/_components/shop/SearchSort";

export const metadata = {
  title: "Shop SmartXstore | Nepal's Premier Tech Store",
  description:
    "Discover SmartXstore - Kathmandu's leading tech store offering the latest gadgets, electronics, and premium customer service.",
  keywords:
    "about SmartXstore, nepal accessories store, gadget shop kathmandu, electronics retailer nepal",
};

export default async function ShopPage({ searchParams }) {
  try {
    const params = await searchParams;

    const category = params?.category || "";
    const brand = params?.brand || "";
    const search = params?.search || "";
    const sortBy = params?.sortBy || "created_at";
    const page = params?.page ? parseInt(params.page) : 1;

    const [categories, brands, priceRange] = await Promise.all([
      getCategories(),
      getBrands(),
      getPriceRange(),
    ]);

    // Use actual priceRange defaults when no params are set
    const actualPriceRange = priceRange || { min: 0, max: 10000 };
    const minPrice = params?.minPrice ? parseFloat(params.minPrice) : actualPriceRange.min;
    const maxPrice = params?.maxPrice ? parseFloat(params.maxPrice) : actualPriceRange.max;

    // Fetch products with correct price filters
    const productsDataWithFilters = await getShopProducts({
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy,
      page,
      limit: 12,
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-5 sm:py-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Shop
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {productsDataWithFilters?.total || 0} products found
                {category && ` in ${category}`}
                {brand && ` by ${brand}`}
                {search && ` matching "${search}"`}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <ShopSidebar
                categories={categories || []}
                brands={brands || []}
                priceRange={actualPriceRange}
                selectedCategory={category}
                selectedBrand={brand}
              />
            </div>

            <div className="lg:w-3/4">
              <SearchSort
                search={search}
                sortBy={sortBy}
                totalProducts={productsDataWithFilters?.total || 0}
              />

              {productsDataWithFilters?.products && productsDataWithFilters.products.length > 0 ? (
                <ProductGrid
                  products={productsDataWithFilters.products}
                  currentPage={productsDataWithFilters.page || 1}
                  totalPages={productsDataWithFilters.totalPages || 0}
                  totalProducts={productsDataWithFilters.total || 0}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">😕</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search term
                  </p>
                  <a
                    href="/shop"
                    className="inline-block px-6 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    Clear all filters
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
}
