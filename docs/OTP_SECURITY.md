# OTP Security & Rate Limiting

## Overview
Leo's Cafe implements a secure phone-based OTP authentication system with comprehensive rate limiting and abuse prevention.

## Security Features Implemented

### ✅ 1. Rate Limiting (Cost Protection)

**Phone-Based Rate Limiting:**
- **Limit**: Maximum 3 OTP requests per phone number per 15 minutes
- **Implementation**: Redis-based with memory fallback
- **Status Code**: 429 (Too Many Requests)
- **Error Message**: "Too many OTP requests. Please try again later."

**Why This Matters:**
- Prevents SMS bombing attacks
- Protects against cost escalation (SMS costs money)
- Prevents user harassment

**Technical Implementation:**
```typescript
// In lib/otp-store.ts
const OTP_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const OTP_MAX_REQUESTS = 3; // Max 3 requests

// Redis atomic counter with expiry
const requestCount = await redis.incr(`otp-requests:${phone}`);
if (requestCount === 1) {
  await redis.expire(`otp-requests:${phone}`, 900); // 15 minutes
}
if (requestCount > 3) {
  return { rateLimited: true };
}
```

### ✅ 2. OTP Expiry & Single-Use

**OTP Lifetime:**
- **Expiry**: 5 minutes (300 seconds)
- **Single-use**: Automatically deleted after successful verification
- **No reuse**: Once verified, same code cannot be used again

**Technical Implementation:**
```typescript
// OTP expires in 5 minutes
const ttlMs = 5 * 60 * 1000;
const expiresAt = Date.now() + ttlMs;

// Deleted after verification
await deleteChallenge(phone);
```

### ✅ 3. Brute Force Protection

**Failed Attempt Limits:**
- **Max Attempts**: 5 incorrect OTP entries
- **Lockout Duration**: 15 minutes after max attempts
- **Status Code**: 429 (Too Many Requests)
- **Error Message**: "Too many incorrect attempts. Please request a new code."

**Progressive Lockout:**
1. Attempt 1-4: "Invalid verification code" (400)
2. Attempt 5+: Account locked for 15 minutes (429)

**Technical Implementation:**
```typescript
const OTP_MAX_ATTEMPTS = 5;
const updated = {
  ...current,
  attemptCount: current.attemptCount + 1,
  lockUntil: current.attemptCount + 1 >= 5 
    ? Date.now() + 15 * 60 * 1000 
    : undefined
};
```

### ✅ 4. No Information Leakage

**Security Principle**: Never reveal whether a phone number exists in the system

**Implementation:**
- ✅ Same response for registered and unregistered numbers
- ✅ Generic success message: "If the number is valid, a verification code has been sent."
- ✅ No different error messages that could reveal user existence
- ✅ Phone numbers are masked in logs: `+92XXXXX1234`

**Example:**
```typescript
// Production response (same for all cases)
return NextResponse.json(
  { success: true, message: "If the number is valid, a verification code has been sent." },
  { status: 200 }
);
```

### ✅ 5. CSRF Protection

**All OTP endpoints require CSRF tokens:**
- Token validated from header (`x-csrf-token`) or cookie (`leo_csrf`)
- Prevents cross-site request forgery attacks
- Returns 403 if token is missing or invalid

### ✅ 6. Secure Storage

**OTP Storage:**
- ✅ OTPs are **hashed** using bcrypt (never stored in plaintext)
- ✅ Challenge records stored in Redis (in-memory, auto-expire)
- ✅ Memory fallback for development
- ✅ No OTP codes in database

**Hash Comparison:**
```typescript
// OTPs are hashed with bcrypt (10 rounds)
const otpHash = await bcrypt.hash(otpCode, 10);

// Timing-safe comparison
const otpMatches = await bcrypt.compare(otpCode, storedHash);
```

## Rate Limit Configuration

### Current Limits

| Type | Limit | Window | Lockout |
|------|-------|--------|---------|
| OTP Requests (per phone) | 3 | 15 min | None (just rate limited) |
| Failed Verifications (per phone) | 5 | Until new OTP | 15 min lockout |
| OTP Validity | N/A | 5 min | Expires |

### Adjusting Limits

To modify rate limits, edit `lib/otp-store.ts`:

```typescript
// At the top of the file
const OTP_TTL_MS = 5 * 60 * 1000;              // OTP expires in 5 minutes
const OTP_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minute window
const OTP_MAX_REQUESTS = 3;                     // Max 3 OTP requests
const OTP_MAX_ATTEMPTS = 5;                     // Max 5 verification attempts
```

**Recommended Values:**
- **Production**: Keep current values (3 requests / 15 min)
- **High-traffic**: Increase to 5 requests / 15 min
- **High-security**: Decrease to 2 requests / 15 min

## Security Monitoring

### Logged Events

All security events are logged for monitoring:

```typescript
// Rate limit triggered
console.warn("[otp/send] ⚠️ RATE LIMITED:", maskPhone(phone));

// Failed verification attempt
console.warn("[otp/verify] Failed attempt for:", maskPhone(phone), "attempts:", count);

// Account locked
console.warn("[otp/verify] Account locked:", maskPhone(phone));

// Successful verification
console.info("[otp] ✅ Verified phone:", maskPhone(phone));
```

### Monitoring Dashboard (Recommended)

Consider integrating with monitoring tools:
- **Vercel Logs**: Built-in log aggregation
- **Datadog**: Full observability
- **Sentry**: Error tracking
- **LogRocket**: Session replay

**Alert on:**
- High rate limit triggers (potential attack)
- Multiple account lockouts (brute force attempt)
- Unusual OTP request patterns
- SMS delivery failures

## Attack Scenarios & Mitigations

### 🚨 Scenario 1: SMS Bombing Attack
**Attack**: Attacker repeatedly requests OTPs for victim's phone

**Mitigation**: ✅ Rate limiting (3 requests / 15 min)
- Attacker can only trigger 3 SMS per 15 minutes
- Cost impact: ~Rs. 30 per hour (minimal)
- User impact: Limited harassment

### 🚨 Scenario 2: Brute Force OTP Guessing
**Attack**: Attacker tries to guess 6-digit OTP

**Mitigation**: ✅ Multiple layers
1. Only 5 attempts before lockout
2. OTP expires in 5 minutes
3. 1 million possible combinations (100000-999999)
4. Probability of success: 5/1,000,000 = 0.0005%

### 🚨 Scenario 3: User Enumeration
**Attack**: Attacker tests if phone numbers are registered

**Mitigation**: ✅ No information leakage
- Same response for all phone numbers
- No timing differences (bcrypt comparison)
- Masked phone numbers in logs

### 🚨 Scenario 4: Replay Attack
**Attack**: Attacker intercepts and reuses OTP

**Mitigation**: ✅ Single-use OTPs
- OTP deleted after successful verification
- Cannot be reused
- Time-limited (5 minutes)

### 🚨 Scenario 5: CSRF Attack
**Attack**: Attacker tricks user into requesting OTP from malicious site

**Mitigation**: ✅ CSRF tokens
- All requests require valid CSRF token
- Token validated from header or secure cookie
- Returns 403 if missing/invalid

## Phone Number Validation

### Supported Formats

Pakistan phone numbers are normalized to E.164 format:

```typescript
// Accepted inputs:
"+923001234567"  → "+923001234567"
"923001234567"   → "+923001234567"
"03001234567"    → "+923001234567"
"3001234567"     → "+923001234567"

// Rejected inputs:
"invalid"        → Error: "Phone number format is invalid"
"12345"          → Error: "Phone number format is invalid"
```

### Normalization Logic

```typescript
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9+]/g, "").trim();

  if (digits.startsWith("+92")) return `+${digits.replace(/^\+/, "")}`;
  if (digits.startsWith("92")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+92${digits.slice(1)}`;
  if (digits.length === 10) return `+92${digits}`;

  throw new Error("Phone number format is invalid");
}
```

## Development Mode

### Testing Without SMS

In development mode (`NODE_ENV=development`):

```typescript
// OTP code is logged to console
console.info("[otp] 🔒 Development OTP Code for +92XXX1234: 123456 (expires in 5 minutes)");

// Also returned in API response
{
  "success": true,
  "message": "Verification code prepared (dev mode).",
  "devOtp": "123456"  // ⚠️ ONLY in development
}
```

**Production Behavior:**
- OTP code is NEVER returned in API response
- OTP code is NEVER logged to console
- SMS is sent via configured provider

## SMS Provider Failover

Multiple SMS providers with automatic fallback:

1. **MSG91** (Primary - Pakistan/India)
2. **Twilio** (Fallback - International)
3. **Generic API** (Last resort)

**Cost Optimization:**
- Prefer cheaper regional providers (MSG91 for Pakistan)
- Failover only if primary fails
- Cache working provider

## Production Checklist

### Before Deploying

- [ ] SMS provider configured (MSG91/Twilio)
- [ ] Redis configured (Upstash for rate limiting)
- [ ] `CSRF_SECRET` environment variable set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-side only
- [ ] Test rate limiting (3 requests should trigger 429)
- [ ] Test account lockout (5 failed attempts)
- [ ] Test OTP expiry (wait 5 minutes)
- [ ] Verify no OTP codes in production logs
- [ ] Verify phone numbers are masked in logs
- [ ] Set up monitoring alerts

### Security Review

- [ ] No hardcoded secrets
- [ ] CSRF protection enabled
- [ ] Rate limiting working
- [ ] OTPs hashed (not plaintext)
- [ ] Error messages don't leak info
- [ ] Phone numbers masked in logs
- [ ] SMS costs monitored

## Compliance & Privacy

### GDPR Compliance

- ✅ Phone numbers are personal data (handled securely)
- ✅ OTPs are temporary and deleted
- ✅ No persistent tracking without consent
- ✅ Users can delete their accounts (includes phone data)

### PCI DSS (if applicable)

- ✅ No payment card data in OTP flow
- ✅ Secure authentication mechanism
- ✅ Audit logging enabled

## Support & Troubleshooting

### Common Issues

**Issue**: "Too many OTP requests"
- **Cause**: More than 3 requests in 15 minutes
- **Solution**: Wait 15 minutes or contact support

**Issue**: "Too many incorrect attempts"
- **Cause**: 5+ wrong OTP entries
- **Solution**: Request new OTP (wait 15 minutes for unlock)

**Issue**: "Invalid verification code"
- **Cause**: Wrong OTP or expired (>5 min)
- **Solution**: Request new OTP

**Issue**: SMS not received
- **Cause**: SMS provider failure or invalid number
- **Solution**: Check phone number format, verify SMS provider config

### Debug Mode

To enable detailed OTP logging (development only):

```bash
# .env.local
NODE_ENV=development
DEBUG=otp:*
```

## Related Documentation

- [Supabase Webhook Security](./SUPABASE_WEBHOOK_SETUP.md)
- [API Security Guide](./API_SECURITY.md) (coming soon)
- [RLS Policies](./RLS_POLICIES.md) (coming soon)

---

**Last Updated**: 2026-07-07  
**Version**: 1.0  
**Security Review**: Pending external audit
