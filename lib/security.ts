import { z } from "zod";

/**
 * Sanitize HTML input to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Sanitize email to prevent injection
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-() ]/g, "").trim();
}

/**
 * Validate and sanitize user input for forms
 */
export const userInputSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .transform(sanitizeInput),
  email: z
    .string()
    .email("Invalid email address")
    .transform(sanitizeEmail),
  phone: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizePhone(val) : undefined)),
  message: z
    .string()
    .max(1000, "Message too long")
    .optional()
    .transform((val) => (val ? sanitizeInput(val) : undefined)),
});

/**
 * Validate order data
 */
export const orderSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().uuid().or(z.string().min(1)),
      quantity: z.number().int().positive().max(99),
      price: z.number().positive().max(999999),
    })
  ),
  total: z.number().positive().max(9999999),
  tableId: z.string().optional(),
  notes: z
    .string()
    .max(500)
    .optional()
    .transform((val) => (val ? sanitizeInput(val) : undefined)),
});

/**
 * Validate reservation data
 */
export const reservationSchema = z.object({
  name: z.string().min(1).max(100).transform(sanitizeInput),
  email: z.string().email().transform(sanitizeEmail),
  phone: z.string().transform(sanitizePhone),
  date: z.string().datetime().or(z.date()),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  persons: z.number().int().positive().max(50),
});

/**
 * Check if string contains potential SQL injection patterns
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|(\\')|(;)|(--)|(\/\*))/gi,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (detectSQLInjection(query)) {
    throw new Error("Invalid search query");
  }
  
  return sanitizeInput(query).slice(0, 100);
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64;
}

/**
 * Check password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): {
  isValid: boolean;
  error?: string;
} {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File too large. Maximum size is 5MB.",
    };
  }

  return { isValid: true };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 255);
}

/**
 * Check if request is from allowed origin (CORS)
 */
export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  return allowedOrigins.some((allowed) => allowed && origin.startsWith(allowed));
}
