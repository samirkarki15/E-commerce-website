"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCart } from "@/app/_context/CartContext";
import { usePathname, useSearchParams } from "next/navigation";

const Navigation = () => {
  const [isScroll, setIsScroll] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef(null);
  const finishTimerRef = useRef(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { cart, itemCount, isLoading: cartLoading, refreshCart } = useCart();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  useEffect(() => {
    const handleScroll = () => {
      setIsScroll(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignIn = () => {
    signIn();
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    closeMenu();
  };

  const clearProgressTimers = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  };

  const startProgress = (href) => {
    if (!href || href === pathname || isNavigating) {
      return;
    }

    clearProgressTimers();
    setIsNavigating(true);
    setProgress(18);

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => (prev < 85 ? prev + Math.random() * 9 : prev));
    }, 180);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const getDesktopNavClass = (href) =>
    `font-medium px-4 py-2 rounded-full transition-colors duration-200 ${
      pathname === href
        ? "text-blue-700 bg-blue-50"
        : "text-gray-700 hover:text-blue-600 hover:bg-white"
    }`;

  // Add cart refresh on auth change
  useEffect(() => {
    if (status === "authenticated") {
      refreshCart();
    }
  }, [status, refreshCart]);

  // Complete progress when route transition actually finishes
  useEffect(() => {
    if (!isNavigating) return;

    clearProgressTimers();
    finishTimerRef.current = setTimeout(() => {
      setProgress(100);

      finishTimerRef.current = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
        finishTimerRef.current = null;
      }, 220);
    }, 10);
  }, [pathname, searchParams, isNavigating]);

  useEffect(() => {
    return () => clearProgressTimers();
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 transition-[width,opacity] duration-300 ease-out shadow-[0_0_12px_rgba(37,99,235,0.55)]"
          style={{
            width: `${progress}%`,
            opacity: isNavigating ? 1 : 0,
          }}
        />
      </div>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScroll
            ? "bg-white/95 backdrop-blur-md shadow-md py-2.5 border-b border-gray-200"
            : "bg-white py-3.5 border-b border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-3">
          {/* Logo - Always left aligned */}
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={() => startProgress("/")}
          >
            <span className="text-2xl font-bold hidden sm:flex items-center gap-1">
              <span className="text-gray-900">Smart</span>
              <span className="bg-[#1E40AF] text-white px-2 py-0.5 rounded-md">
                X
              </span>
              <span className="text-gray-900">store</span>
            </span>
            {/* Mobile logo - visible only on small screens */}
            <span className="text-2xl font-bold flex sm:hidden items-center gap-1">
              <span className="text-gray-900">Smart</span>
              <span className="bg-[#1E40AF] text-white px-2 py-0.5 rounded-md">
                X
              </span>
              <span className="text-gray-900">store</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1 bg-gray-50/90 rounded-full px-2.5 py-1.5 border border-gray-200">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  className={getDesktopNavClass(link.href)}
                  href={link.href}
                  onClick={() => startProgress(link.href)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* My Orders Link */}
            <Link
              href="/orders"
              className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
              onClick={() => startProgress("/orders")}
            >
              <span className="text-lg">📦</span>
              <span className="hidden lg:inline">My Orders</span>
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors relative px-2 py-1 rounded-lg hover:bg-gray-50"
              onClick={() => startProgress("/cart")}
            >
              <span className="text-lg">🛒</span>
              {!cartLoading && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
              {cartLoading && (
                <span className="absolute -top-2 -right-2 bg-gray-300 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                </span>
              )}
              <span className="hidden lg:inline">Cart</span>
            </Link>

            {/* User Menu - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              {isLoading ? (
                <div className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {/* Account Link - Removed Sign Out button */}
                  <Link
                    href="/account"
                    className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors"
                    onClick={() => startProgress("/account")}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {session?.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-blue-600 font-medium">
                          {session?.user?.name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-gray-900">
                        {session?.user?.name?.split(" ")[0] || "Account"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session?.user?.role === "admin"
                          ? "Admin"
                          : "My Account"}
                      </p>
                    </div>
                  </Link>

                  {/* Admin Dashboard Link */}
                  {session?.user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-4 py-2 rounded-full transition-colors duration-200 text-sm"
                      onClick={() => startProgress("/admin")}
                    >
                      Dashboard
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-full transition-colors duration-200"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              onClick={openMenu}
              type="button"
            >
              <div className="flex flex-col space-y-1">
                <div className="w-6 h-0.5 bg-gray-700"></div>
                <div className="w-6 h-0.5 bg-gray-700"></div>
                <div className="w-6 h-0.5 bg-gray-700"></div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Side Menu */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 z-50 bg-white shadow-2xl transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header - Updated logo to match desktop */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => {
                startProgress("/");
                closeMenu();
              }}
            >
              <span className="text-2xl font-bold flex items-center gap-1">
                <span className="text-gray-900">Smart</span>
                <span className="bg-[#1E40AF] text-white px-2 py-0.5 rounded-md">
                  X
                </span>
                <span className="text-gray-900">store</span>
              </span>
            </Link>
            <button
              onClick={closeMenu}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              type="button"
            >
              <span className="text-xl text-gray-600">×</span>
            </button>
          </div>

          {/* User Info Section - Mobile */}
          <div className="p-6 border-b border-gray-200">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <span className="text-2xl text-blue-600 font-medium">
                      {session?.user?.name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session?.user?.email}
                  </p>
                  {session?.user?.role === "admin" && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Welcome to smartXstore!</p>
                <button
                  onClick={() => {
                    handleSignIn();
                    closeMenu();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-1">
              <Link
                className="flex items-center space-x-3 p-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                href="/"
                onClick={() => {
                  startProgress("/");
                  closeMenu();
                }}
              >
                <span className="text-lg">🏠</span>
                <span className="font-medium">Home</span>
              </Link>

              <Link
                className="flex items-center space-x-3 p-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                href="/shop"
                onClick={() => {
                  startProgress("/shop");
                  closeMenu();
                }}
              >
                <span className="text-lg">🛍️</span>
                <span className="font-medium">Shop</span>
              </Link>

              <Link
                className="flex items-center space-x-3 p-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                href="/about"
                onClick={() => {
                  startProgress("/about");
                  closeMenu();
                }}
              >
                <span className="text-lg">ℹ️</span>
                <span className="font-medium">About Us</span>
              </Link>

              <Link
                className="flex items-center space-x-3 p-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                href="/blog"
                onClick={() => {
                  startProgress("/blog");
                  closeMenu();
                }}
              >
                <span className="text-lg">📝</span>
                <span className="font-medium">Blog</span>
              </Link>

              <Link
                className="flex items-center space-x-3 p-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                href="/contact"
                onClick={() => {
                  startProgress("/contact");
                  closeMenu();
                }}
              >
                <span className="text-lg">📞</span>
                <span className="font-medium">Contact</span>
              </Link>
            </div>

            {/* Authenticated User Menu - REMOVED WISHLIST */}
            {isAuthenticated && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <Link
                  className="flex items-center space-x-3 p-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  href="/account"
                  onClick={() => {
                    startProgress("/account");
                    closeMenu();
                  }}
                >
                  <span className="text-lg">👤</span>
                  <span className="font-medium">My Account</span>
                </Link>

                {session?.user?.role === "admin" && (
                  <Link
                    className="flex items-center space-x-3 p-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    href="/admin"
                    onClick={() => {
                      startProgress("/admin");
                      closeMenu();
                    }}
                  >
                    <span className="text-lg">📊</span>
                    <span className="font-medium">Admin Dashboard</span>
                  </Link>
                )}

                <Link
                  className="flex items-center space-x-3 p-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  href="/orders"
                  onClick={() => {
                    startProgress("/orders");
                    closeMenu();
                  }}
                >
                  <span className="text-lg">📦</span>
                  <span className="font-medium">My Orders</span>
                </Link>
              </div>
            )}

            {/* Cart - Always Visible */}
            <div
              className={`mt-8 pt-8 border-t border-gray-200 ${isAuthenticated ? "" : "mt-0 pt-0 border-t-0"}`}
            >
              <Link
                className="flex items-center space-x-3 p-4 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                href="/cart"
                onClick={() => {
                  startProgress("/cart");
                  closeMenu();
                }}
              >
                <span className="text-lg">🛒</span>
                <span className="font-medium">Cart</span>
                <span className="ml-auto bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    itemCount
                  )}
                </span>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 rounded-lg transition-colors duration-200 border border-red-200"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  handleSignIn();
                  closeMenu();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
              >
                Sign In
              </button>
            )}
            <p className="text-sm text-gray-500 text-center mt-4">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-blue-600 hover:underline"
                onClick={() => {
                  startProgress("/contact");
                  closeMenu();
                }}
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeMenu} />
      )}

      {/* Spacer below fixed nav */}
      <div className="h-16 sm:h-20"></div>
    </>
  );
};

export default Navigation;
