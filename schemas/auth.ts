/**
 * Auth & User Schemas
 * Epic 1 - Shared validation schemas for auth flows
 * CLAUDE.md rule 8: Same schema validates client + server
 */

import { z } from "zod";

// Phone validation for Pakistani numbers
export const phoneSchema = z
  .string()
  .regex(/^(\+92|0)?3\d{9}$/, "Invalid Pakistani phone number")
  .transform((val) => val.replace(/^0/, "+92")); // Normalize to +92 format

// Signup schema - includes birthday for Epic 5
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: phoneSchema,
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

export type SignupInput = z.infer<typeof signupSchema>;

// Login schema
export const loginSchema = z.object({
  phone: phoneSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

// OTP verification schema
export const otpVerifySchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/, "OTP must be numeric"),
});

export type OTPVerifyInput = z.infer<typeof otpVerifySchema>;
