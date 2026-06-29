/**
 * QR Token Generation & Verification
 * Epic 6 - Dine-In QR Ordering
 * HMAC-SHA256 signed tokens for table QR codes
 */

import crypto from "crypto";

const QR_TOKEN_SECRET = process.env.QR_TOKEN_SECRET || "dev_secret_change_in_prod";

export interface QRTokenPayload {
  tableId: string;
  qrVersion: number;
  issuedAt: number;
}

/**
 * Generate signed QR token
 */
export function generateQRToken(tableId: string, qrVersion: number): string {
  const issuedAt = Date.now();
  const payload: QRTokenPayload = { tableId, qrVersion, issuedAt };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString("base64url");

  // HMAC-SHA256 signature
  const signature = crypto
    .createHmac("sha256", QR_TOKEN_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode QR token
 * CLAUDE.md: Verify signature BEFORE any database lookup
 */
export function verifyQRToken(token: string): QRTokenPayload | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    // Verify signature first (before any DB lookup)
    const expectedSignature = crypto
      .createHmac("sha256", QR_TOKEN_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    // Decode payload
    const payloadStr = Buffer.from(payloadB64, "base64url").toString();
    const payload: QRTokenPayload = JSON.parse(payloadStr);

    // Basic validation
    if (!payload.tableId || typeof payload.qrVersion !== "number") return null;

    return payload;
  } catch (error) {
    return null;
  }
}
