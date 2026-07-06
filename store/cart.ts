/**
 * Cart Store - Zustand
 * Epic 2 - Persistent cart state with localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // Unique cart item ID (not menu item ID)
  itemId: string; // Menu item ID
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  customizations?: Record<string, unknown>;
  isAvailable?: boolean; // Track availability status
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  checkAvailability: (itemId: string) => Promise<boolean>;
  removeUnavailableItems: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          // Check if item with same customizations exists
          const existingIndex = state.items.findIndex(
            (i) =>
              i.itemId === item.itemId &&
              JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
          );

          if (existingIndex >= 0) {
            // Update quantity of existing item
            const newItems = [...state.items];
            newItems[existingIndex].quantity += item.quantity;
            return { items: newItems };
          }

          // Add new item with unique ID
          return {
            items: [
              ...state.items,
              { ...item, id: `cart-${Date.now()}-${Math.random()}` },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      checkAvailability: async (itemId: string) => {
        try {
          const res = await fetch(`/api/menu/${itemId}/availability`);
          if (!res.ok) return false;
          const data = await res.json();
          return data.available;
        } catch (error) {
          console.error("Availability check failed:", error);
          return false;
        }
      },

      removeUnavailableItems: () =>
        set((state) => ({
          items: state.items.filter((item) => item.isAvailable !== false),
        })),
    }),
    {
      name: "leos-cafe-cart", // localStorage key
    }
  )
);
