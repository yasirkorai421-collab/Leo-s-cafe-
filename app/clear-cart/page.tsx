"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";

export default function ClearCartPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart
    clearCart();
    
    // Clear localStorage completely to remove old data format
    if (typeof window !== 'undefined') {
      localStorage.removeItem('leos-cafe-cart');
    }

    // Redirect to menu after 2 seconds
    setTimeout(() => {
      router.push('/menu');
    }, 2000);
  }, [clearCart, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500 mx-auto animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Cart Cleared!</h1>
        <p className="text-gray-600 mb-4">
          Your cart has been updated to work with our new system.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to menu...
        </p>
      </div>
    </div>
  );
}
