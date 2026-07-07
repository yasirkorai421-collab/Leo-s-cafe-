# Supabase Webhook Security Setup

## Overview
This guide explains how to configure secure webhooks between Supabase and your Leo's Cafe application.

## Why Webhook Security Matters
Without signature verification, anyone could send fake webhook requests to your API, potentially:
- Creating unauthorized admin users
- Modifying user data
- Deleting users
- Bypassing authentication

## Setup Steps

### Step 1: Generate Webhook Secret

On your local machine or in a terminal, run:

```bash
openssl rand -base64 32
```

Copy the output (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6==`)

### Step 2: Add to Environment Variables

#### Local Development (.env.local):
```env
SUPABASE_WEBHOOK_SECRET=your_generated_secret_here
```

#### Vercel Production:
1. Go to https://vercel.com/dashboard
2. Select your Leo's Cafe project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `SUPABASE_WEBHOOK_SECRET`
   - **Value**: `your_generated_secret_here`
   - **Environment**: Production, Preview, Development
5. Click **Save**
6. **Redeploy** your application

### Step 3: Configure Supabase Webhook

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/database/webhooks
2. Click **Create a new hook** or edit existing hook
3. Configure:
   - **Name**: `sync-users-to-prisma`
   - **Table**: `auth.users`
   - **Events**: Check `Insert`, `Update`, `Delete`
   - **Type**: `HTTP Request`
   - **HTTP URL**: `https://your-vercel-url.vercel.app/api/webhooks/supabase`
   - **HTTP Method**: `POST`
   - **HTTP Headers**: Click **Add header**
     - **Header**: `x-supabase-signature`
     - **Value**: `v1={signature}`
   - **Webhook Secret**: Paste your generated secret from Step 1
4. Click **Create webhook** or **Save**

### Step 4: Test the Webhook

#### Option 1: Test via Supabase Dashboard
1. In Supabase Dashboard → Database → Webhooks
2. Find your webhook
3. Click **Send test event**
4. Check the webhook logs for success (200) or failure

#### Option 2: Test by Creating a User
1. Try signing up a new user in your app
2. Check Vercel logs or Supabase webhook logs
3. Verify the user was created in your Prisma database

#### Option 3: Test Signature Verification
Try sending a webhook without signature (should fail with 401):

```bash
curl -X POST https://your-vercel-url.vercel.app/api/webhooks/supabase \
  -H "Content-Type: application/json" \
  -d '{"type":"INSERT","table":"users","schema":"auth","record":{"id":"test"}}'
```

Expected response: `{"error":"Unauthorized"}` with status 401

### Step 5: Verify Security

✅ **Checklist:**
- [ ] Webhook secret is configured in Vercel environment variables
- [ ] Webhook secret is NOT committed to Git (check .env.local is in .gitignore)
- [ ] Supabase webhook is configured with the secret
- [ ] Test webhook returns 401 when signature is missing
- [ ] Test webhook succeeds (200) when signature is valid
- [ ] Webhook logs show "Invalid signature" errors are properly logged

## Troubleshooting

### Webhook Returns 401 "Unauthorized"
**Cause**: Signature mismatch

**Solutions**:
1. Verify `SUPABASE_WEBHOOK_SECRET` matches in both Vercel and Supabase
2. Check for extra spaces or newlines in the secret
3. Ensure you redeployed after adding the environment variable
4. In Supabase, make sure header is `x-supabase-signature` with value `v1={signature}`

### Webhook Returns 500 "Webhook not configured"
**Cause**: `SUPABASE_WEBHOOK_SECRET` environment variable is missing

**Solution**: Add the variable in Vercel Settings → Environment Variables and redeploy

### Users Not Syncing to Prisma Database
**Causes**:
1. Webhook not triggered by Supabase
2. Webhook URL is incorrect
3. Signature verification failing silently

**Solutions**:
1. Check Supabase webhook logs for delivery attempts
2. Verify webhook URL includes `/api/webhooks/supabase`
3. Check Vercel function logs for errors
4. Ensure events (INSERT, UPDATE, DELETE) are enabled on `auth.users` table

### Development Mode Testing
For local development without ngrok:

1. Disable signature check temporarily (NOT for production):
   ```typescript
   // In app/api/webhooks/supabase/route.ts (development only)
   if (process.env.NODE_ENV === 'development') {
     // Skip signature verification for local testing
   } else {
     // Verify signature in production
   }
   ```

2. Use Supabase CLI local instance
3. Or use ngrok to expose localhost and configure webhook to ngrok URL

## Security Best Practices

✅ **DO:**
- Use strong webhook secrets (32+ characters, random)
- Rotate webhook secrets periodically (every 6-12 months)
- Monitor webhook logs for suspicious activity
- Use HTTPS only for webhook endpoints
- Validate and sanitize all webhook payload data

❌ **DON'T:**
- Commit webhook secrets to Git
- Share webhook secrets in documentation or Slack
- Use predictable secrets like "password123"
- Disable signature verification in production
- Expose webhook endpoints publicly without authentication

## Additional Security Layers

### Rate Limiting (Recommended)
Consider adding rate limiting to webhook endpoints:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }
  
  // Continue with webhook processing...
}
```

### IP Allowlisting (Optional)
Supabase webhooks come from specific IP ranges. You can restrict access:

```typescript
const SUPABASE_WEBHOOK_IPS = [
  // Add Supabase webhook IP ranges here
  // Check Supabase documentation for current IPs
];

const clientIP = req.headers.get("x-forwarded-for");
if (!SUPABASE_WEBHOOK_IPS.includes(clientIP)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

## Support
- Supabase Webhooks Documentation: https://supabase.com/docs/guides/database/webhooks
- Leo's Cafe Security Issues: Create a GitHub issue

---

**Last Updated**: 2026-07-07  
**Version**: 1.0
