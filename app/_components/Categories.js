// components/home/CategoriesGrid.js - FIXED VERSION (no styled-jsx)
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  FaTshirt,
  FaMobileAlt,
  FaHome,
  FaLaptop,
  FaGamepad,
  FaBook,
  FaCar,
  FaHeart,
  FaUtensils,
  FaDumbbell,
  FaMobile,
  FaBox,
  FaGlasses,
  FaHeadphones,
  FaTv,
  FaCamera,
} from "react-icons/fa";

import { GiWatch } from "react-icons/gi";

// Create Supabase client with service role key for server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Icon mapping for categories
const getIconForCategory = (categoryName) => {
  const lowerName = categoryName?.toLowerCase() || "";

  if (lowerName.includes("fashion") || lowerName.includes("clothing")) {
    return <FaTshirt />;
  }
  if (lowerName.includes("electronic")) {
    return <FaTv />;
  }
  if (lowerName.includes("creator") || lowerName.includes("camera")) {
    return <FaCamera />;
  }
  if (lowerName.includes("computer") || lowerName.includes("laptop")) {
    return <FaLaptop />;
  }
  if (lowerName.includes("game")) {
    return <FaGamepad />;
  }
  if (lowerName.includes("watch")) {
    return <GiWatch />;
  }
  if (lowerName.includes("mobile") || lowerName.includes("cover")) {
    return <FaMobileAlt />;
  }
  if (lowerName.includes("style") || lowerName.includes("glass")) {
    return <FaGlasses />;
  }
  if (lowerName.includes("kitchen") || lowerName.includes("food")) {
    return <FaUtensils />;
  }
  if (lowerName.includes("headphone")) {
    return <FaHeadphones />;
  }
  if (lowerName.includes("sport") || lowerName.includes("fitness")) {
    return <FaDumbbell />;
  }

  // Default icon
  return <FaBox />;
};

// Fetch categories data separately
async function getCategoriesData() {
  try {
    // Fetch unique categories from published products
    const { data: categoriesData, error } = await supabase
      .from("products")
      .select("category_name")
      .not("category_name", "is", null) // Only products with category
      .eq("is_published", true) // Only published products
      .limit(50);

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    // Get unique categories and count products in each
    const categoryMap = new Map();

    if (categoriesData && categoriesData.length > 0) {
      categoriesData.forEach((item) => {
        const category = item.category_name;
        if (category) {
          categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        }
      });
    }

    // Convert to array and sort by count (most products first)
    const categories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        icon: getIconForCategory(name),
      }))
      .sort((a, b) => b.count - a.count) // Sort by product count
      .slice(0, 6); // Take top 6 categories

    return categories;
  } catch (error) {
    console.error("Unexpected error in getCategoriesData:", error);
    return [];
  }
}

// Add CSS animation via global CSS or Tailwind classes
// Add this to your global.css or use Tailwind animation classes

export default async function CategoriesGrid() {
  // Fetch data first
  const categories = await getCategoriesData();

  // If no categories found, show fallback
  if (categories.length === 0) {
    return <FallbackCategoriesGrid />;
  }

  // Render UI with fetched data
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg">
            Explore our wide range of products ({categories.length} categories)
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, idx) => (
            <Link
              key={category.slug}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group animate-fade-in-up"
              style={{
                animationDelay: `${idx * 100}ms`,
              }}
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-300 relative overflow-hidden group/card h-full">
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl mb-4 group-hover/card:scale-110 group-hover/card:from-blue-200 group-hover/card:to-cyan-200 transition-all duration-300 mx-auto">
                      <div className="text-3xl text-blue-600">
                        {category.icon}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-800 group-hover/card:text-blue-700 transition-colors text-base md:text-lg mb-2">
                      {category.name}
                    </h3>

                    <p className="text-sm text-gray-500 mb-3">
                      {category.count} product{category.count !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="mt-auto inline-flex items-center gap-1 text-blue-600 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 justify-center">
                    <span className="text-sm font-medium">Browse</span>
                    <span className="group-hover/card:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Link */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg px-6 py-3 rounded-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            View All Categories
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Fallback component if there's an error or no categories
function FallbackCategoriesGrid() {
  const fallbackCategories = [
    { id: 1, name: "Fashion", icon: <FaTshirt />, slug: "fashion" },
    { id: 2, name: "Electronics", icon: <FaMobileAlt />, slug: "electronics" },
    { id: 3, name: "Home & Living", icon: <FaHome />, slug: "home-living" },
    { id: 4, name: "Computers", icon: <FaLaptop />, slug: "computers" },
    { id: 5, name: "Gaming", icon: <FaGamepad />, slug: "gaming" },
    { id: 6, name: "Books", icon: <FaBook />, slug: "books" },
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg">
            Explore our wide range of products
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {fallbackCategories.map((category, idx) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group animate-fade-in-up"
              style={{
                animationDelay: `${idx * 100}ms`,
              }}
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-300 relative overflow-hidden group/card">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl mb-4 group-hover/card:scale-110 group-hover/card:from-blue-200 group-hover/card:to-cyan-200 transition-all duration-300">
                    <div className="text-3xl text-blue-600">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover/card:text-blue-700 transition-colors text-base md:text-lg">
                    {category.name}
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-1 text-blue-600 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Shop</span>
                    <span className="group-hover/card:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
