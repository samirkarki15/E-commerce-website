// app/layout.js - UPDATED
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import Navigation from "@/app/_components/Navigation";
import { CartProvider } from "@/app/_context/CartContext";
import "@/app/_styles/globals.css";

export const metadata = {
  title: "smartXstore - Tech Gadgets",
  description:
    "Buy the best tech gadgets - headphones, chargers, mice, keyboards and more",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-300">
        <SessionProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <Navigation />
            </Suspense>
            <main>{children}</main>
            <footer className="flex justify-center items-center py-4 bg-gray-800 text-white">
              Copyright © 2026 smartXstore. All rights reserved.
            </footer>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
