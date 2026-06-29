/**
 * Checkout & Order Schemas
 * Epic 2 - Validation for checkout and order creation
 * CLAUDE.md rule 8: Same schema validates client + server
 */

import { z } from "zod";
import { phoneSchema } from "./auth";

// Checkout form schema - NO payment fields (Epic 3)
export const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: phoneSchema,
  deliveryAddress: z.string().min(10, "Please provide a complete address").max(500),
  notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// Order creation schema - server-side
export const createOrderSchema = checkoutSchema.extend({
  items: z.array(
    z.object({
      itemId: z.string().uuid(),
      quantity: z.number().int().min(1),
      customizations: z.record(z.string(), z.unknown()).optional(),
    })
  ).min(1, "Cart cannot be empty"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
