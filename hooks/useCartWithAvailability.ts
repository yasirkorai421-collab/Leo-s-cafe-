/**
 * Custom hook to add cart functionality with availability checking
 */

import { useCart, CartItem } from "@/store/cart";
import { toast } from "react-hot-toast";

export function useCartWithAvailability() {
  const cart = useCart();

  const addItemWithCheck = async (item: Omit<CartItem, "id">) => {
    // For database-backed items, check availability
    if (item.itemId && !item.itemId.includes('-')) { // UUID format check
      try {
        const res = await fetch(`/api/menu/${item.itemId}/availability`);
        
        if (!res.ok) {
          if (res.status === 404) {
            toast.error(`${item.name} is no longer available`);
          } else {
            toast.error("Unable to check item availability");
          }
          return false;
        }

        const data = await res.json();
        
        if (!data.available) {
          toast.error(`${item.name} is currently unavailable`);
          return false;
        }

        // Add availability flag
        cart.addItem({ ...item, isAvailable: true });
        return true;
      } catch (error) {
        console.error("Availability check error:", error);
        toast.error("Unable to verify item availability");
        return false;
      }
    } else {
      // For non-database items (legacy support), add directly
      cart.addItem(item);
      return true;
    }
  };

  return {
    ...cart,
    addItemWithCheck,
  };
}
