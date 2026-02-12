// app/page.js or pages/index.js
import HeroCarousel from "@/app/_components/HeroCarousel";
import HotDeals from "@/app/_components/HotDeals";
import Categories from "@/app/_components/Categories";
import PopularProducts from "@/app/_components/PopularProducts";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Hot Deals Section */}
      <HotDeals />

      {/* 3. Categories Section */}
      <Categories />

      {/* 4. Popular Products */}
      <PopularProducts />
    </main>
  );
}
