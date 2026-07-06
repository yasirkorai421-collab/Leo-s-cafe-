"use client";

import { useCart } from "@/store/cart";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function FloatingCartButton() {
  const { items } = useCart();
  const [isPulse, setIsPulse] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Pulse animation when items added
  useEffect(() => {
    if (totalItems > prevCount) {
      setIsPulse(true);
      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      setTimeout(() => setIsPulse(false), 600);
    }
    setPrevCount(totalItems);
  }, [totalItems, prevCount]);

  // Don't show if cart is empty
  if (totalItems === 0) return null;

  return (
    <Link
      href="/cart"
      className={`fixed bottom-6 right-6 z-50 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:shadow-orange-500/50 hover:scale-110 ${
        isPulse ? 'animate-pulse scale-110' : ''
      }`}
      style={{
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label={`View cart with ${totalItems} items`}
    >
      {/* Cart Icon */}
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>

      {/* Badge with count */}
      <div
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full font-bold text-xs flex items-center justify-center shadow-lg"
        style={{
          width: '28px',
          height: '28px',
          minWidth: '28px',
          minHeight: '28px',
        }}
      >
        {totalItems}
      </div>
    </Link>
  );
}
