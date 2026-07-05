import test from "node:test";
import assert from "node:assert/strict";

import { generateOtpCode, normalizePhoneNumber, createOtpChallenge, verifyOtpChallenge, maskPhone, isOtpExpired } from "../lib/otp-store";

test("generateOtpCode returns a 6-digit numeric code", () => {
  const code = generateOtpCode();

  assert.match(code, /^\d{6}$/);
  assert.equal(code.length, 6);
});

test("normalizePhoneNumber converts local Pakistani numbers to E.164", () => {
  assert.equal(normalizePhoneNumber("03001234567"), "+923001234567");
  assert.equal(normalizePhoneNumber("+923001234567"), "+923001234567");
});

test("createOtpChallenge stores an expiry and supports rate limiting", async () => {
  const phone = "+923001234567";
  const challenge = await createOtpChallenge(phone, { maxAttempts: 3, ttlMs: 5 * 60 * 1000 });

  assert.ok(challenge.id);
  assert.ok(challenge.expiresAt > Date.now());
  assert.equal(challenge.attemptCount, 0);
  assert.equal(challenge.locked, false);

  const second = await createOtpChallenge(phone, { maxAttempts: 3, ttlMs: 5 * 60 * 1000, rateLimitWindowMs: 15 * 60 * 1000 });
  assert.equal(second.rateLimited, false);
});

test("verifyOtpChallenge succeeds once and fails after too many wrong attempts", async () => {
  const phone = "+923001234568";
  const challenge = await createOtpChallenge(phone, { maxAttempts: 3, ttlMs: 5 * 60 * 1000 });

  const wrong = await verifyOtpChallenge(phone, "000000", challenge.otpHash);
  assert.equal(wrong.success, false);
  assert.equal(wrong.attemptCount, 1);

  const correct = await verifyOtpChallenge(phone, challenge.otpCode);
  assert.equal(correct.success, true);

  const lockoutPhone = "+923001234569";
  const lockoutChallenge = await createOtpChallenge(lockoutPhone, { maxAttempts: 3, ttlMs: 5 * 60 * 1000 });
  const wrongAgain = await verifyOtpChallenge(lockoutPhone, "000001", lockoutChallenge.otpHash);
  assert.equal(wrongAgain.success, false);
  assert.equal(wrongAgain.attemptCount, 1);

  const wrongAgain2 = await verifyOtpChallenge(lockoutPhone, "000002", lockoutChallenge.otpHash);
  assert.equal(wrongAgain2.success, false);
  assert.equal(wrongAgain2.attemptCount, 2);

  const wrongAgain3 = await verifyOtpChallenge(lockoutPhone, "000003", lockoutChallenge.otpHash);
  assert.equal(wrongAgain3.success, false);
  assert.equal(wrongAgain3.attemptCount, 3);
  assert.equal(wrongAgain3.locked, true);
});

test("isOtpExpired returns true when expiry has passed", () => {
  const expired = isOtpExpired(Date.now() - 1000);
  const active = isOtpExpired(Date.now() + 1000);

  assert.equal(expired, true);
  assert.equal(active, false);
});

test("maskPhone hides most digits for logging", () => {
  assert.equal(maskPhone("+923001234567"), "+92XXXXX4567");
});
