/**
 * Cart Availability Checker Component
 * Validates cart items availability on checkout page
 */

"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { toast } from "react-hot-toast";

export function CartAvailabilityChecker() {
  const { items, removeItem, removeUnavailableItems } = useCart();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkCartAvailability();
  }, []);

  const checkCartAvailability = async () => {
    if (items.length === 0) return;

    setChecking(true);
    const unavailableItems: string[] = [];

    for (const item of items) {
      // Only check database items (UUID format)
      if (item.itemId && !item.itemId.includes('-')) {
        try {
          const res = await fetch(`/api/menu/${item.itemId}/availability`);
          
          if (!res.ok || !(await res.json()).available) {
            unavailableItems.push(item.name);
            removeItem(item.id);
          }
        } catch (error) {
          console.error(`Failed to check availability for ${item.name}:`, error);
        }
      }
    }

    setChecking(false);

    if (unavailableItems.length > 0) {
      toast.error(
        `${unavailableItems.length} item(s) removed from cart (no longer available): ${unavailableItems.join(", ")}`,
        { duration: 5000 }
      );
    }
  };

  if (checking) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-sm text-blue-800">Checking item availability...</p>
        </div>
      </div>
    );
  }

  return null;
}
