// app/contact/page.js
import React from "react";
import Link from "next/link";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaComments,
} from "react-icons/fa";

export const metadata = {
  title: "Contact Us | SmartXstore - WhatsApp Support",
  description:
    "Contact SmartXstore via WhatsApp for instant support. We're available to assist with inquiries, orders, and tech support through WhatsApp messaging.",
  keywords:
    "whatsapp contact smartxstore, nepal tech support, whatsapp chat support, gadget inquiries whatsapp",
};

export default function ContactPage() {
  const whatsappNumber = "+9779742304520"; // Replace with your WhatsApp number
  const whatsappMessage =
    "Hello! I'm contacting you from the SmartXstore website. I need assistance with:";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <FaWhatsapp className="text-5xl text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Chat with us on{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-green-200">
                WhatsApp
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-10 max-w-3xl mx-auto">
              We prefer WhatsApp for quick and easy communication. Get instant
              support for inquiries, orders, and tech assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white text-green-600 font-bold text-xl rounded-full hover:bg-green-50 transition-all duration-300 hover:scale-105 shadow-2xl animate-bounce"
              >
                <FaWhatsapp className="text-2xl" />
                Click to Chat on WhatsApp
              </a>
            </div>
            <p className="text-lg text-green-200 max-w-2xl mx-auto mt-8">
              We typically reply within 2-3 minutes during business hours
            </p>
          </div>
        </div>
      </div>

      {/* Why WhatsApp Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why We Use WhatsApp
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            WhatsApp has become Nepal's preferred communication platform for its
            convenience and accessibility
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl border border-green-200 p-8 shadow-lg hover:shadow-xl transition-all text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaComments className="text-2xl text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Instant Communication
            </h3>
            <p className="text-gray-600">
              Real-time chat support for quick responses to your queries, order
              updates, and technical assistance.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-green-200 p-8 shadow-lg hover:shadow-xl transition-all text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-green-600">📱</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Mobile-First
            </h3>
            <p className="text-gray-600">
              Perfect for Nepal's mobile-centric internet usage. Access support
              directly from your smartphone.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-green-200 p-8 shadow-lg hover:shadow-xl transition-all text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-green-600">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Easy Media Sharing
            </h3>
            <p className="text-gray-600">
              Share product photos, videos, and screenshots directly through
              WhatsApp for better assistance.
            </p>
          </div>
        </div>

        {/* Alternative Contact Methods */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Other Ways to Reach Us
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPhone className="text-lg text-green-700" />
              </div>
              <h4 className="font-bold text-gray-900">Phone Call</h4>
              <p className="text-sm text-gray-600">+977-1-1234567</p>
              <p className="text-xs text-gray-500">Sun-Fri, 9AM-6PM</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-lg text-green-700" />
              </div>
              <h4 className="font-bold text-gray-900">Email</h4>
              <p className="text-sm text-gray-600">support@smartgadget.com</p>
              <p className="text-xs text-gray-500">24/7 for non-urgent</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="text-lg text-green-700" />
              </div>
              <h4 className="font-bold text-gray-900">Visit Store</h4>
              <p className="text-sm text-gray-600">
                Sinamangal Road, Kathmandu
              </p>
              <p className="text-xs text-gray-500">See hours below</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-lg text-green-700" />
              </div>
              <h4 className="font-bold text-gray-900">Facebook</h4>
              <p className="text-sm text-gray-600">@SmartXstore</p>
              <p className="text-xs text-gray-500">Message us anytime</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Instructions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            How to Contact Us via WhatsApp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Tap the Green Button
                  </h4>
                  <p className="text-gray-600">
                    Click the "Click to Chat on WhatsApp" button above to open
                    WhatsApp automatically
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Message is Pre-filled
                  </h4>
                  <p className="text-gray-600">
                    Your message will open with "Hello! I'm contacting you
                    from..." already typed
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Add Your Inquiry
                  </h4>
                  <p className="text-gray-600">
                    Complete the message with your specific question or order
                    details
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Send & Wait for Reply
                  </h4>
                  <p className="text-gray-600">
                    Tap send and our team will respond within minutes during
                    business hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              📍 Visit Our Physical Store
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="text-xl text-green-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Address</h4>
                  <p className="text-gray-600">SmartXstore</p>
                  <p className="text-gray-600">Sinamangal Road, Kathmandu</p>
                  <p className="text-gray-600">Nepal</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <FaClock className="text-xl text-green-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Business Hours
                  </h4>
                  <div className="space-y-1">
                    <p className="text-gray-600 flex justify-between">
                      <span>Sunday - Friday: </span>
                      <span className="font-medium"> 9:00 AM - 6:00 PM</span>
                    </p>
                    <p className="text-gray-600 flex justify-between">
                      <span>Saturday:</span>
                      <span className="font-medium">Closed</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              💡 Before You Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">
                  <strong>Order Number Ready:</strong> Have your order number
                  handy for faster service
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">
                  <strong>Clear Questions:</strong> Be specific about your
                  inquiry for quicker resolution
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">
                  <strong>Photos/Videos:</strong> Prepare to share images if
                  it's a product issue
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">
                  <strong>Patience Please:</strong> We get many messages but we
                  reply to everyone
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-white">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <FaWhatsapp className="text-4xl" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-4">Ready to Chat?</h3>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              WhatsApp is the fastest way to get support from our team. Click
              the button below to start your conversation.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-12 py-5 bg-white text-green-600 font-bold text-xl rounded-full hover:bg-green-50 transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              <FaWhatsapp className="text-2xl" />
              Open WhatsApp Now
            </a>
            <p className="text-green-200 text-sm mt-6">
              ⏰ Best time to message: Weekdays 10 AM - 5 PM for fastest
              response
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center text-gray-500 text-sm">
          <p>
            We value every message and strive to provide the best customer
            service experience.
          </p>
          <p className="mt-2">Thank you for choosing SmartXstore!</p>
        </div>
      </div>
    </div>
  );
}
