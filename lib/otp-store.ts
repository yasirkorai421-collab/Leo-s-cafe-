import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const OTP_MAX_REQUESTS = 3;
const OTP_MAX_ATTEMPTS = 5;

interface OtpChallengeRecord {
  id: string;
  phone: string;
  otpHash: string;
  expiresAt: number;
  attemptCount: number;
  lockUntil?: number;
  maxAttempts: number;
  createdAt: number;
}

interface OtpChallengeResponse {
  id: string;
  otpCode: string;
  otpHash: string;
  expiresAt: number;
  attemptCount: number;
  locked: boolean;
  rateLimited: boolean;
}

interface OtpVerificationResponse {
  success: boolean;
  attemptCount: number;
  locked: boolean;
}

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis !== null) {
    return redis;
  }

  // Only try to initialize Redis if env vars are set
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return redis;
  } catch (err) {
    console.error("[otp-store] Failed to initialize Redis:", err);
    return null;
  }
}

async function getPrismaClient() {
  try {
    return await import("@/lib/prisma").then((module) => module.default).catch(() => null);
  } catch {
    return null;
  }
}

const memoryStore = new Map<string, OtpChallengeRecord>();
const memoryRateLimitStore = new Map<string, { count: number; windowStart: number }>();

function getStorageKey(phone: string): string {
  return `otp:${phone}`;
}

function getRateLimitKey(phone: string): string {
  return `otp-rate:${phone}`;
}

function parsePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, "").trim();
}

export function normalizePhoneNumber(phone: string): string {
  const digits = parsePhone(phone);

  if (!digits) {
    throw new Error("Phone number is required");
  }

  if (digits.startsWith("+92")) {
    return `+${digits.replace(/^\+/, "")}`;
  }

  if (digits.startsWith("92")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return `+92${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `+92${digits}`;
  }

  throw new Error("Phone number format is invalid");
}

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOtpCode(otpCode: string): Promise<string> {
  return bcrypt.hash(otpCode, 10);
}

async function compareOtpCode(otpCode: string, otpHash: string): Promise<boolean> {
  return bcrypt.compare(otpCode, otpHash);
}

export function maskPhone(phone: string): string {
  if (!phone) return "***";
  if (phone.length <= 7) return phone;
  return `${phone.slice(0, 3)}XXXXX${phone.slice(-4)}`;
}

export function isOtpExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

async function readChallenge(phone: string): Promise<OtpChallengeRecord | null> {
  const key = getStorageKey(phone);

  const redisClient = getRedis();
  if (redisClient) {
    try {
      const stored = await redisClient.get<OtpChallengeRecord>(key);
      if (stored) {
        return stored;
      }
    } catch (err) {
      console.error("[otp-store] Redis read error:", err);
    }
  }

  return memoryStore.get(key) ?? null;
}

/**
 * Check if a challenge is locked due to too many failed attempts
 */
export async function checkChallengeLocked(phone: string): Promise<{ locked: boolean; attemptCount: number }> {
  const challenge = await readChallenge(phone);
  
  if (!challenge) {
    return { locked: false, attemptCount: 0 };
  }
  
  const now = Date.now();
  const locked = Boolean(challenge.lockUntil && challenge.lockUntil > now);
  
  return { locked, attemptCount: challenge.attemptCount };
}

async function writeChallenge(challenge: OtpChallengeRecord): Promise<void> {
  const key = getStorageKey(challenge.phone);

  const redisClient = getRedis();
  if (redisClient) {
    try {
      await redisClient.set(key, challenge, { ex: Math.max(1, Math.floor((challenge.expiresAt - Date.now()) / 1000)) });
      return;
    } catch (err) {
      console.error("[otp-store] Redis write error:", err);
    }
  }

  memoryStore.set(key, challenge);
}

async function deleteChallenge(phone: string): Promise<void> {
  const key = getStorageKey(phone);

  const redisClient = getRedis();
  if (redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (err) {
      console.error("[otp-store] Redis delete error:", err);
    }
  }

  memoryStore.delete(key);
}

async function incrementAttemptCount(phone: string): Promise<void> {
  const current = await readChallenge(phone);
  if (!current) {
    return;
  }

  const updated: OtpChallengeRecord = {
    ...current,
    attemptCount: current.attemptCount + 1,
    lockUntil: current.attemptCount + 1 >= current.maxAttempts ? Date.now() + 15 * 60 * 1000 : current.lockUntil,
  };

  await writeChallenge(updated);
}

function checkRateLimit(phone: string, windowMs: number, maxRequests: number) {
  const now = Date.now();
  const key = getRateLimitKey(phone);
  const current = memoryRateLimitStore.get(key);

  if (!current || now - current.windowStart >= windowMs) {
    memoryRateLimitStore.set(key, { count: 1, windowStart: now });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count += 1;
  return false;
}

export async function createOtpChallenge(
  phone: string,
  options: {
    ttlMs?: number;
    maxAttempts?: number;
    rateLimitWindowMs?: number;
    maxRequests?: number;
  } = {}
): Promise<OtpChallengeResponse> {
  const ttlMs = options.ttlMs ?? OTP_TTL_MS;
  const rateLimitWindowMs = options.rateLimitWindowMs ?? OTP_RATE_LIMIT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? OTP_MAX_REQUESTS;
  const maxAttempts = options.maxAttempts ?? OTP_MAX_ATTEMPTS;
  const otpCode = generateOtpCode();
  const otpHash = await hashOtpCode(otpCode);
  const now = Date.now();
  const expiresAt = now + ttlMs;

  const key = getStorageKey(phone);
  const redisClient = getRedis();
  if (redisClient) {
    try {
      const requestCount = await redisClient.incr(`otp-requests:${phone}`);
      if (requestCount === 1) {
        await redisClient.expire(`otp-requests:${phone}`, Math.floor(rateLimitWindowMs / 1000));
      }
      if (requestCount > maxRequests) {
        return {
          id: "",
          otpCode,
          otpHash,
          expiresAt,
          attemptCount: 0,
          locked: false,
          rateLimited: true,
        };
      }
    } catch (err) {
      console.error("[otp-store] Redis rate limit check error:", err);
      // Fall through to memory-based rate limiting if Redis fails
    }
  }
  
  if (!redisClient && checkRateLimit(phone, rateLimitWindowMs, maxRequests)) {
    return {
      id: "",
      otpCode,
      otpHash,
      expiresAt,
      attemptCount: 0,
      locked: false,
      rateLimited: true,
    };
  }

  const challenge: OtpChallengeRecord = {
    id: crypto.randomUUID(),
    phone,
    otpHash,
    expiresAt,
    attemptCount: 0,
    maxAttempts,
    createdAt: now,
  };

  await writeChallenge(challenge);

  return {
    id: challenge.id,
    otpCode,
    otpHash,
    expiresAt,
    attemptCount: 0,
    locked: false,
    rateLimited: false,
  };
}

export async function verifyOtpChallenge(
  phone: string,
  otpCode: string,
  expectedHash?: string
): Promise<OtpVerificationResponse> {
  const current = await readChallenge(phone);

  if (!current) {
    return { success: false, attemptCount: 0, locked: false };
  }

  const now = Date.now();
  if (current.lockUntil && current.lockUntil > now) {
    return { success: false, attemptCount: current.attemptCount, locked: true };
  }

  if (isOtpExpired(current.expiresAt)) {
    await deleteChallenge(phone);
    return { success: false, attemptCount: current.attemptCount, locked: false };
  }

  const otpMatches = await compareOtpCode(otpCode, expectedHash ?? current.otpHash);

  if (!otpMatches) {
    await incrementAttemptCount(phone);
    const updated = await readChallenge(phone);
    const locked = (updated?.attemptCount ?? 0) >= (updated?.maxAttempts ?? OTP_MAX_ATTEMPTS);
    return { success: false, attemptCount: updated?.attemptCount ?? 0, locked };
  }

  await deleteChallenge(phone);
  return { success: true, attemptCount: current.attemptCount, locked: false };
}
