// app/about/page.js
import React from "react";
import Link from "next/link";
import {
  FaStore,
  FaUsers,
  FaAward,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
} from "react-icons/fa";

export const metadata = {
  title: "About SmartXstore | Nepal's Premier Tech Store",
  description:
    "Discover SmartXstore - Kathmandu's leading tech store offering the latest gadgets, electronics, and premium customer service.",
  keywords:
    "about smartxstore, nepal accessories store, gadget shop kathmandu, electronics retailer nepal",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                SmartXstore
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Nepal&apos;s premier destination for cutting-edge technology and
              innovative gadgets.
            </p>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              We deliver the latest tech products with exceptional service and
              unbeatable value.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Journey in Kathmandu
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Founded in the heart of Kathmandu, SmartXstore began as a small
                passion project by tech enthusiasts who believed that everyone
                in Nepal deserved access to the latest technology.
              </p>
              <p>
                What started as a modest store on Sinamangal Road has now grown
                into one of Kathmandu&apos;s most trusted names in electronics
                and gadgets. Our journey has been fueled by our commitment to
                bringing innovative products to the Nepali market.
              </p>
              <p>
                Today, we serve many satisfied customers across Nepal, offering
                everything from smartphones and laptops to smart home devices
                and gaming accessories.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🏢</div>
              <p className="text-gray-700 font-medium">Our Flagship Store</p>
              <p className="text-gray-500">Sinamangal Road, Kathmandu</p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Makes Us Different
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re more than just a store - we&apos;re your tech partners
              in Nepal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <FaStore className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Physical Store Presence
              </h3>
              <p className="text-gray-600">
                Visit our flagship store in Kathmandu to experience products
                firsthand with expert guidance from our staff.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <FaShieldAlt className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Genuine Products Guarantee
              </h3>
              <p className="text-gray-600">
                Every product is 100% authentic with official warranties and
                after-sales support from authorized service centers.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <FaAward className="text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Best Price Promise
              </h3>
              <p className="text-gray-600">
                We offer the most competitive prices in Nepal with regular
                discounts and special offers for our loyal customers.
              </p>
            </div>
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate tech enthusiasts dedicated to helping you make the
              right choice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">SR</span>
              </div>
              <h4 className="font-bold text-gray-900">Anoj subedi</h4>
              <p className="text-sm text-gray-600">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">SP</span>
              </div>
              <h4 className="font-bold text-gray-900">Samir Karki</h4>
              <p className="text-sm text-gray-600">Tech Specialist</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">PS</span>
              </div>
              <h4 className="font-bold text-gray-900">Purushottam Subedi</h4>
              <p className="text-sm text-gray-600">Sales Manager</p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tech solutions for every need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                <FaTruck className="text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Free Delivery</h4>
              <p className="text-sm text-gray-600">
                Free shipping on orders above रु 500
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                <FaHeadset className="text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Details Support</h4>
              <p className="text-sm text-gray-600">
                Technical assistance and product information from our store
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                <span className="text-orange-600 font-bold text-xl">🔐</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Warranty Support</h4>
              <p className="text-sm text-gray-600">
                Different warranty options available for various products
              </p>
            </div>
          </div>
        </div>

        {/* Location & Store Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              📍 Our Kathmandu Store
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Address</h4>
                <p className="text-gray-600">SmartXstore Flagship Store</p>
                <p className="text-gray-600">Sinamangal Road, Kathmandu</p>
                <p className="text-gray-600">Nepal</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Store Hours</h4>
                <div className="space-y-1">
                  <p className="text-gray-600 flex justify-between">
                    <span>Sunday - Thursday:</span>
                    <span className="font-medium">10:00 AM - 7:00 PM</span>
                  </p>
                  <p className="text-gray-600 flex justify-between">
                    <span>Friday:</span>
                    <span className="font-medium">10:00 AM - 6:00 PM</span>
                  </p>
                  <p className="text-gray-600 flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-medium">11:00 AM - 5:00 PM</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              📈 Our Growth
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-700">Years Serving Nepal</span>
                <span className="text-2xl font-bold text-blue-600">5+</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-700">Happy Customers</span>
                <span className="text-2xl font-bold text-purple-600">
                  1000+
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-700">Products Available</span>
                <span className="text-2xl font-bold text-green-600">200+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Cities Covered</span>
                <span className="text-2xl font-bold text-orange-600">
                  Kathmandu
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
              <p className="text-blue-100 text-lg">
                To make cutting-edge technology accessible and affordable for
                every Nepali, while providing exceptional customer service and
                building lasting relationships with our community.
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
              <p className="text-blue-100 text-lg">
                To become Nepal&apos;s most trusted and innovative tech
                retailer, recognized for our product expertise, customer-first
                approach, and contribution to digital empowerment across the
                country.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-xl">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Experience SmartXstore Today
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Visit our store in Kathmandu or browse our online collection to
              discover the latest in technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
              >
                Browse Products
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all duration-300"
              >
                Visit Our Store
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">
            Thank you for choosing SmartXstore!
          </p>
          <p>Your trusted tech partner in Nepal</p>
        </div>
      </div>
    </div>
  );
}
