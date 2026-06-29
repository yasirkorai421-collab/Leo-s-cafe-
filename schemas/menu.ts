/**
 * Menu & Cart Schemas
 * Epic 2 - Validation for menu browsing and cart operations
 */

import { z } from "zod";

// Customization option schema
export const customizationOptionSchema = z.object({
  name: z.string(),
  price: z.number().min(0).optional(),
});

// Cart item customization
export const cartCustomizationSchema = z.object({
  label: z.string(),
  selected: z.union([z.string(), z.array(z.string())]),
});

// Add to cart schema
export const addToCartSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  customizations: z.array(cartCustomizationSchema).optional(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
