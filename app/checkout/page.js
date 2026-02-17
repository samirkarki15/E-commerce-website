// app/checkout/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getCart } from "@/app/_lib/actions/cart-actions";
import { createOrder } from "@/app/_lib/actions/order-actions";

// Nepali districts list
const NEPALI_DISTRICTS = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Biratnagar",
  "Birgunj",
  "Dharan",
  "Bharatpur",
  "Janakpur",
  "Hetauda",
  "Butwal",
  "Dhankuta",
  "Ilam",
  "Jhapa",
  "Morang",
  "Sunsari",
  "Saptari",
  "Siraha",
  "Dhanusha",
  "Mahottari",
  "Sarlahi",
  "Rautahat",
  "Bara",
  "Parsa",
  "Chitwan",
  "Makwanpur",
  "Baglung",
  "Gorkha",
  "Lamjung",
  "Kaski",
  "Syangja",
  "Tanahun",
  "Nawalparasi",
  "Rupandehi",
  "Kapilvastu",
  "Arghakhanchi",
  "Palpa",
  "Gulmi",
  "Parasi",
  "Rukum",
  "Rolpa",
  "Pyuthan",
  "Dang",
  "Banke",
  "Bardiya",
  "Surkhet",
  "Dailekh",
  "Jajarkot",
  "Dolpa",
  "Humla",
  "Mugu",
  "Kalikot",
  "Jumla",
  "Bajura",
  "Bajhang",
  "Achham",
  "Doti",
  "Kailali",
  "Kanchanpur",
  "Dadeldhura",
  "Baitadi",
  "Darchula",
  "Taplejung",
  "Panchthar",
  "Terhathum",
  "Sankhuwasabha",
  "Solukhumbu",
  "Okhaldhunga",
  "Khotang",
  "Udayapur",
  "Sindhuli",
  "Ramechhap",
  "Dolakha",
  "Sindhupalchok",
  "Kavrepalanchok",
  "Rasuwa",
  "Nuwakot",
  "Dhading",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    district: "",
    notes: "",
    paymentMethod: "cod", // Default to Cash on Delivery
  });

  // Load cart on mount
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      router.push("/cart");
      return;
    }

    if (status === "authenticated") {
      loadCart();
    }
  }, [status, router]);

  async function loadCart() {
    try {
      setLoading(true);
      setError(null);
      const data = await getCart();

      if (!data || !data.items) {
        setError("Could not load cart. Please try again.");
        setCart(null);
        return;
      }

      if (data.items.length === 0) {
        setError("Your cart is empty. Add items before checking out.");
        setCart(data);
        return;
      }

      setCart(data);
    } catch (err) {
      setError("Failed to load cart. Please try again.");
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cart || !cart.items || cart.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Form validation
    if (!form.fullName.trim()) {
      alert("Please enter your full name");
      return;
    }

    if (!form.phoneNumber.trim()) {
      alert("Please enter your phone number");
      return;
    }

    if (!form.address.trim()) {
      alert("Please enter your address");
      return;
    }

    if (!form.district) {
      alert("Please select your district");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Prepare shipping address for Nepal
      const shippingAddress = {
        full_name: form.fullName.trim(),
        phone_number: form.phoneNumber.trim(),
        address: form.address.trim(),
        district: form.district,
        country: "Nepal",
      };

      const result = await createOrder({
        shippingAddress,
        billingAddress: shippingAddress, // Use same address for billing
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim() || null,
        // Additional Nepal-specific fields can be added here
        orderType: "nepal_delivery",
      });

      if (result.success) {
        router.push(`/order-confirmation/${result.orderNumber}`);
      } else {
        setError(result.error || "Order creation failed. Please try again.");
      }
    } catch (error) {
      setError("Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Format phone number
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    let formattedValue = value;

    // Format as Nepali phone number (98XXXXXXXX)
    if (value.length > 2) {
      formattedValue = value;
    }

    setForm({ ...form, phoneNumber: formattedValue });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error && (!cart || !cart.items || cart.items.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">
            Complete your order with delivery in Nepal
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form - Nepal Specific */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="border-b pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2">📍</span>
                    Delivery Information (Nepal)
                  </h2>

                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                        placeholder="Ram Bahadur Shrestha"
                      />
                    </div>

                    {/* Phone Number - Nepal specific */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          +977
                        </div>
                        <input
                          type="tel"
                          required
                          className="w-full border border-gray-300 rounded-lg pl-16 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          value={form.phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="98XXXXXXXX"
                          maxLength="10"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Enter 10-digit mobile number (e.g., 9841234567)
                      </p>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complete Address *
                      </label>
                      <textarea
                        required
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                        placeholder="Ward No., Street, Tole, Landmark"
                      />
                    </div>

                    {/* District Select */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District *
                      </label>
                      <select
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                        value={form.district}
                        onChange={(e) =>
                          setForm({ ...form, district: e.target.value })
                        }
                      >
                        <option value="">Select District</option>
                        {NEPALI_DISTRICTS.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes/Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Instructions (Optional)
                      </label>
                      <textarea
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        value={form.notes}
                        onChange={(e) =>
                          setForm({ ...form, notes: e.target.value })
                        }
                        placeholder="e.g., Call before delivery, Leave at security, Special instructions..."
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border-b pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2">💳</span>
                    Payment Method
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={form.paymentMethod === "cod"}
                        onChange={(e) =>
                          setForm({ ...form, paymentMethod: e.target.value })
                        }
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="cod" className="ml-3 flex items-center">
                        <span className="text-gray-900 font-medium">
                          Cash on Delivery (COD)
                        </span>
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Recommended
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="online"
                        name="paymentMethod"
                        value="online"
                        checked={form.paymentMethod === "online"}
                        onChange={(e) =>
                          setForm({ ...form, paymentMethod: e.target.value })
                        }
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="online" className="ml-3">
                        <span className="text-gray-900 font-medium">
                          Online Payment
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          (Khalti, eSewa, ConnectIPS)
                        </span>
                      </label>
                    </div>

                    {/* Online Payment Instructions - UPDATED FLOW */}
                    {form.paymentMethod === "online" && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">
                          Online Payment Process:
                        </h3>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                          <li>
                            <strong>First, place your order</strong> with online
                            payment option
                          </li>
                          <li>
                            You'll be redirected to{" "}
                            <strong>order confirmation page</strong>
                          </li>
                          <li>
                            On that page, click the{" "}
                            <strong>WhatsApp button</strong> to pay
                          </li>
                          <li>
                            We'll share payment details (Khalti/eSewa) via
                            WhatsApp
                          </li>
                          <li>
                            Send payment screenshot to complete your order
                          </li>
                        </ol>
                        <div className="mt-3 p-3 bg-white border border-blue-100 rounded">
                          <p className="text-sm text-blue-600">
                            💡 <strong>Note:</strong> Your order will be
                            reserved for 24 hours
                          </p>
                        </div>
                      </div>
                    )}

                    {/* COD Information */}
                    {form.paymentMethod === "cod" && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm">
                          <span className="font-medium">
                            ✓ Cash on Delivery Available
                          </span>
                          <br />
                          <span className="text-green-700">
                            Pay when your order arrives. Additional delivery
                            charges may apply for remote areas.
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    ← Back to Cart
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !cart?.items?.length}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Security Note */}
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Your personal information is secure. We don't share your
                    details with third parties.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-2">📦</span>
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {cart?.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start text-sm pb-4 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-2">
                        {item.product?.name}
                      </p>
                      <p className="text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900 whitespace-nowrap ml-4">
                      रु {item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    रु {cart?.summary?.subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {cart?.summary?.shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `रु ${cart?.summary?.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (13% VAT)</span>
                  <span className="font-medium">
                    रु {cart?.summary?.tax.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t pt-4">
                  <span>Total Amount</span>
                  <span className="text-blue-600">
                    रु {cart?.summary?.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Delivery Info
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">🚚</span>
                    <span>3-7 business days delivery</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">📞</span>
                    <span>We'll call before delivery</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">🔄</span>
                    <span>Free returns within 7 days</span>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Need help?</p>
                <a
                  href="tel:+9779841234567"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  <span>📞</span>
                  <span>+977-9841234567</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
