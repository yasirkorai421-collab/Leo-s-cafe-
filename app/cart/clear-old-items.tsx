"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";

export default function ClearOldCartItems() {
  const { items, clearCart } = useCart();
  const [shouldClear, setShouldClear] = useState(false);

  useEffect(() => {
    // Check if any items have invalid IDs (not UUIDs)
    const hasInvalidItems = items.some(item => {
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return !uuidPattern.test(item.itemId);
    });

    if (hasInvalidItems) {
      setShouldClear(true);
    }
  }, [items]);

  useEffect(() => {
    if (shouldClear) {
      const timer = setTimeout(() => {
        clearCart();
        window.location.href = '/menu';
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shouldClear, clearCart]);

  if (!shouldClear) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Updating Your Cart</h2>
        <p className="text-gray-600 mb-4">
          We've updated our menu system! Your old cart items need to be cleared.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to menu in 3 seconds...
        </p>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full animate-[width_3s_linear]" style={{animation: 'progress 3s linear forwards'}}></div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
