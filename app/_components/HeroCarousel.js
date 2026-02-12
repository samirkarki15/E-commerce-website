// components/home/HeroCarousel.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    id: 1,
    title: "Creators Collection 2026",
    subtitle: "Up to 20% OFF",
    description: "Discover the latest trends in techs",
    buttonText: "Shop Now",
    buttonLink: "/shop?collection=creators",
    image: "/hero-1.png", // This should be in public folder
    bgColor: "from-blue-100 to-purple-100",
    textColor: "text-gray-900",
  },
  {
    id: 2,
    title: "Smart Gadgets",
    subtitle: "Latest Tech",
    description: "Smartphones, Laptops & Accessories",
    buttonText: "Explore Tech",
    buttonLink: "/shop?category=electronics",
    image: "/hero-2.png", // Add hero-2.png to public folder
    bgColor: "from-gray-100 to-blue-50",
    textColor: "text-gray-900",
  },
  {
    id: 3,
    title: "Free Shipping",
    subtitle: "On All Orders",
    description: "No minimum purchase required",
    buttonText: "Start Shopping",
    buttonLink: "/shop",
    image: "/hero-3.png", // Add hero-3.png to public folder
    bgColor: "from-green-50 to-blue-50",
    textColor: "text-gray-900",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(
      () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      },
      isMobile ? 4000 : 5000,
    ); // Faster rotation on mobile

    return () => clearInterval(interval);
  }, [isAutoPlaying, isMobile]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Touch handlers for swipe gesture
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div
        className="relative h-[500px] sm:h-[550px] md:h-[600px] lg:h-[700px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor}`}
            />

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex md:items-center items-start pt-6 md:pt-0">
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-12 items-start md:items-center w-full">
                {/* Image - Mobile (Top) */}
                <div className="relative w-full md:hidden order-first">
                  <div className="relative w-full h-48 sm:h-56">
                    <div className="relative w-full h-full rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                      {slide.image ? (
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          priority={index === 0}
                          sizes="100vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-5xl mb-2">🛍️</div>
                            <p className="text-lg">Hero Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div
                  className={`space-y-4 sm:space-y-6 w-full md:w-auto ${slide.textColor}`}
                >
                  <div>
                    <p className="text-sm sm:text-lg font-semibold text-blue-600 mb-1 sm:mb-2">
                      {slide.subtitle}
                    </p>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight break-words">
                      {slide.title}
                    </h1>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-lg">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
                    <Link
                      href={slide.buttonLink}
                      className="inline-flex items-center justify-center px-4 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl active:scale-95 w-full sm:w-auto"
                    >
                      {slide.buttonText}
                    </Link>
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center px-4 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-300 active:scale-95 w-full sm:w-auto"
                    >
                      Browse All
                    </Link>
                  </div>

                  {/* Features - Hidden on very small screens, shown on sm and up */}
                  <div className="hidden sm:flex flex-wrap gap-3 sm:gap-6 pt-2 sm:pt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-xs sm:text-base">
                          ✓
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600">
                        Free Shipping
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs sm:text-base">
                          ✓
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600">
                        Easy Returns
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 text-xs sm:text-base">
                          ✓
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600">
                        Secure Payment
                      </span>
                    </div>
                  </div>
                </div>

                {/* Image - Desktop (Right side) */}
                <div className="relative w-full hidden md:block">
                  <div className="relative w-full h-72 md:h-96">
                    <div className="absolute -top-4 -right-4 w-full h-full bg-blue-200 rounded-2xl transform rotate-3"></div>
                    <div className="absolute top-4 right-4 w-full h-full bg-blue-100 rounded-2xl transform -rotate-3"></div>
                    {/* Use Next.js Image component */}
                    <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden">
                      {slide.image ? (
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          priority={index === 0}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-2">🛍️</div>
                            <p className="text-lg">Hero Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows - Hidden on mobile, visible on md and up */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white shadow-lg items-center justify-center transition-all hover:scale-110"
          aria-label="Previous slide"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 hover:bg-white shadow-lg items-center justify-center transition-all hover:scale-110"
          aria-label="Next slide"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1.5 sm:space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`transition-all rounded-full ${
                idx === currentSlide
                  ? "bg-blue-600 w-6 sm:w-8 h-2 sm:h-3"
                  : "bg-gray-300 hover:bg-gray-400 w-2 sm:w-3 h-2 sm:h-3"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
