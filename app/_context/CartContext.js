// app/_context/CartContext.js - FINAL VERSION
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getCart } from "@/app/_lib/actions/cart-actions";

const CartContext = createContext({
  cart: null,
  itemCount: 0,
  isLoading: true,
  refreshCart: () => {},
});

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Stable refresh function
  const refreshCartData = useCallback(async () => {
    setIsLoading(true);
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for cart refresh events from other components
  useEffect(() => {
    const handleCartRefresh = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener("cart-refresh", handleCartRefresh);

    return () => {
      window.removeEventListener("cart-refresh", handleCartRefresh);
    };
  }, []);

  // Initial load
  useEffect(() => {
    refreshCartData();
  }, [refreshCartData]);

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refreshCartData();
    }
  }, [refreshTrigger, refreshCartData]);

  const itemCount = cart?.summary?.itemCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isLoading,
        refreshCart: refreshCartData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
