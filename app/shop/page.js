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
    const minPrice = params?.minPrice ? parseFloat(params.minPrice) : 0;
    const maxPrice = params?.maxPrice ? parseFloat(params.maxPrice) : 10000;
    const search = params?.search || "";
    const sortBy = params?.sortBy || "created_at";
    const page = params?.page ? parseInt(params.page) : 1;

    const [productsData, categories, brands, priceRange] = await Promise.all([
      getShopProducts({
        category,
        brand,
        minPrice,
        maxPrice,
        search,
        sortBy,
        page,
        limit: 12,
      }),
      getCategories(),
      getBrands(),
      getPriceRange(),
    ]);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 sm:py-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Shop
              </h1>
              <p className="text-gray-600 mt-2 font-medium">
                {productsData?.total || 0} products found
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
                priceRange={priceRange || { min: 0, max: 1000 }}
                selectedCategory={category}
                selectedBrand={brand}
                selectedMinPrice={minPrice}
                selectedMaxPrice={maxPrice}
              />
            </div>

            <div className="lg:w-3/4">
              <SearchSort
                search={search}
                sortBy={sortBy}
                totalProducts={productsData?.total || 0}
              />

              {productsData?.products && productsData.products.length > 0 ? (
                <ProductGrid
                  products={productsData.products}
                  currentPage={productsData.page || 1}
                  totalPages={productsData.totalPages || 0}
                  totalProducts={productsData.total || 0}
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
    console.error("Error in ShopPage:", error);
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
