// app/cart/page.js - UPDATED WITH LOGIN REQUIREMENT AND रु CURRENCY
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "@/app/_lib/actions/cart-actions";
import { useCart } from "@/app/_context/CartContext";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const { refreshCart: refreshCartContext } = useCart();

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCart();
      setCart(data);
    } catch (err) {
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [status]); // Reload when auth status changes

  async function updateQuantity(itemId, quantity) {
    // Check auth first
    if (status !== "authenticated") {
      alert("Please login to update cart");
      return;
    }

    const result = await updateCartItem(itemId, quantity);
    if (result.success) {
      await loadCart();
      // Refresh cart context for navbar update
      await refreshCartContext();
    } else {
      if (result.error === "login_required") {
        alert("Please login to update cart");
      } else {
        alert(result.error || "Failed to update quantity");
      }
    }
  }

  async function removeItem(itemId) {
    // Check auth first
    if (status !== "authenticated") {
      alert("Please login to remove items");
      return;
    }

    if (confirm("Remove this item from cart?")) {
      const result = await removeFromCart(itemId);
      if (result.success) {
        await loadCart();
        // Refresh cart context for navbar update
        await refreshCartContext();
      } else {
        if (result.error === "login_required") {
          alert("Please login to remove items");
        } else {
          alert(result.error || "Failed to remove item");
        }
      }
    }
  }

  async function handleClearCart() {
    // Check auth first
    if (status !== "authenticated") {
      alert("Please login to clear cart");
      return;
    }

    if (confirm("Clear all items from cart?")) {
      const result = await clearCart();
      if (result.success) {
        await loadCart();
        // Refresh cart context for navbar update
        await refreshCartContext();
      } else {
        if (result.error === "login_required") {
          alert("Please login to clear cart");
        } else {
          alert(result.error || "Failed to clear cart");
        }
      }
    }
  }

  // Handle login
  const handleLogin = () => {
    signIn("google", {
      callbackUrl: "/cart",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCart}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show login required screen for guest users
  if (cart?.requiresLogin || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Login Required
          </h1>
          <p className="text-gray-600 mb-8">
            Please login to view and manage your shopping cart.
          </p>

          <button
            onClick={handleLogin}
            className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition mb-4"
          >
            Login with Google
          </button>

          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
            <h3 className="font-medium text-blue-900 mb-3">
              Benefits of logging in:
            </h3>
            <ul className="text-left text-blue-800">
              <li className="mb-2 flex items-center">
                <span className="mr-2">✅</span>
                Save your cart across devices
              </li>
              <li className="mb-2 flex items-center">
                <span className="mr-2">✅</span>
                Faster checkout process
              </li>
              <li className="mb-2 flex items-center">
                <span className="mr-2">✅</span>
                Track your order history
              </li>
              <li className="flex items-center">
                <span className="mr-2">✅</span>
                Get personalized recommendations
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <Link
              href="/shop"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Continue shopping as guest
            </Link>
            <p className="text-sm text-gray-500 mt-2">
              You can browse products without login
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart for logged-in users
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>

          <div className="space-x-4">
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>

            {status === "authenticated" && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
                <p className="text-green-800">
                  <span className="font-medium">✅ Logged in as:</span>{" "}
                  {session.user.email}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Your cart will be saved automatically
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const subtotal = Number(cart.summary.subtotal || 0);
  const shipping = subtotal > 500 ? 0 : 100;
  const total = subtotal + shipping;

  // Show cart with items (only for logged-in users)
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Info Bar */}
        {status === "authenticated" && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="text-green-800 font-medium">
                    Logged in as: {session.user.email}
                  </p>
                  <p className="text-sm text-green-700">
                    Your cart is saved to your account
                  </p>
                </div>
              </div>
              <span className="text-sm text-green-700">
                {cart.summary.itemCount} items • रु
                {Number(total).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart ({cart.summary.itemCount} items)
          </h1>
          <button
            onClick={handleClearCart}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row gap-6"
              >
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                    {item.product?.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center">
                              <span class="text-gray-400">📷</span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">📷</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        <Link
                          href={`/product/${item.product?.id}`}
                          className="hover:text-blue-600"
                        >
                          {item.product?.name}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mt-1">
                        रु {Number(item.product?.price).toLocaleString("en-IN")}{" "}
                        each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        रु {Number(item.subtotal).toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-gray-500">
                        रु {Number(item.product?.price).toLocaleString("en-IN")}{" "}
                        × {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            updateQuantity(item.id, Math.max(1, val));
                          }}
                          min="1"
                          max={item.product?.quantity || 100}
                          className="w-16 text-center border-x py-1"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= (item.product?.quantity || 100)
                          }
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      {item.product?.maxQuantity > 0 && (
                        <span className="text-sm text-gray-500">
                          Max: {item.product?.quantity}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    रु {Number(cart.summary.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    रु {Number(shipping).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      रु {Number(total).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Including shipping
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <Link
                  href="/checkout"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="block w-full border border-gray-300 text-gray-700 text-center py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>• Free shipping on orders over रु500</p>
                <p>• Secure checkout</p>
              </div>

              {/* Login reminder */}
              {status === "authenticated" ? (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">✅ Cart saved:</span> Your
                    cart is saved to your account
                  </p>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">⚠️ Login recommended:</span>{" "}
                    <button
                      onClick={handleLogin}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Login
                    </button>{" "}
                    to save your cart
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


