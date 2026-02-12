// app/auth/signin/page.js
"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", {
      callbackUrl: "/",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 backdrop-blur-xl">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-100">Sign in to your smartXstore account</p>
          </div>

          {/* Body */}
          <div className="px-8 py-10">
            {/* Info boxes */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Secure Login
                  </p>
                  <p className="text-xs text-gray-600">
                    Protected by Google authentication
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    One-Click Access
                  </p>
                  <p className="text-xs text-gray-600">
                    Quick and easy sign in with Google
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                  <span className="text-purple-600 text-xs">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Your Data</p>
                  <p className="text-xs text-gray-600">
                    We respect your privacy and security
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">
                  Sign in with
                </span>
              </div>
            </div>

            {/* Sign in button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-75 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              {/* Button shine effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform group-hover:translate-x-full transition-all duration-700"
                style={{ transform: "translateX(-100%)" }}
              ></div>

              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Help text */}
            <p className="text-center text-xs text-gray-600 mt-6">
              Don't have an account?{" "}
              <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Create one
              </button>
            </p>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            <span className="inline-block">Need help?</span>{" "}
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
