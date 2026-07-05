# 🚀 Deploy: Send SMS Hook Edge Function

Step-by-step deployment checklist for the custom Send SMS Hook.

---

## Prerequisites

- [ ] Supabase CLI installed: `npm i -g supabase`
- [ ] Supabase project exists and you have the **project ref** (e.g. `abcdefghijklmnop`)
- [ ] Pakistani SMS gateway account created and API key obtained
- [ ] Supabase project is on a **paid plan** (Auth Hooks require Pro plan or higher)

---

## 1. Login & Link

```bash
# Login to Supabase CLI (opens browser for auth)
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>
```

---

## 2. Set Secrets

```bash
# The hook signing secret — you'll get this from the Dashboard in step 5
# For now, set a placeholder; update after enabling the hook
supabase secrets set SEND_SMS_HOOK_SECRET="v1,whsec_your_secret_here"

# Your Pakistani SMS gateway credentials
supabase secrets set GATEWAY_API_URL="https://your-gateway.com/api/send"
supabase secrets set GATEWAY_API_KEY="your_api_key_here"
```

---

## 3. Deploy the Edge Function

```bash
supabase functions deploy send-sms-hook --no-verify-jwt
```

> ⚠️ `--no-verify-jwt` is **required**. Supabase Auth calls this hook
> server-to-server using its own webhook signature — NOT a user JWT.
> The function verifies authenticity via `standardwebhooks` HMAC instead.

---

## 4. Verify Deployment

```bash
# Check the function is listed
supabase functions list

# View logs (useful for debugging)
supabase functions logs send-sms-hook
```

Your function URL will be:
```
https://<project-ref>.supabase.co/functions/v1/send-sms-hook
```

---

## 5. Enable the Hook in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Hooks**
2. Find **Send SMS** in the hooks list
3. Click **Enable Hook**
4. Set **Hook type** to **HTTP Request**
5. Set **URL** to:
   ```
   https://<project-ref>.supabase.co/functions/v1/send-sms-hook
   ```
6. A **Signing Secret** will be generated (format: `v1,whsec_...`)
7. **Copy the signing secret** and update it:
   ```bash
   supabase secrets set SEND_SMS_HOOK_SECRET="v1,whsec_the_real_secret"
   ```
8. Click **Save**

---

## 6. Configure Phone Provider

1. Go to **Authentication** → **Providers** → **Phone**
2. Ensure **Phone** is **enabled**
3. **Important**: You do NOT need to configure Twilio/Vonage/MessageBird here.
   The Send SMS Hook **overrides** the built-in provider entirely.
   - If a built-in provider (e.g. Twilio) is still selected, the hook takes
     precedence as long as it's enabled
   - You can leave the built-in provider fields empty or filled — the hook
     intercepts before they're used

---

## 7. Test End-to-End

1. Open your app's signup/login page
2. Enter a Pakistani phone number (e.g. `+923361234567`)
3. Submit to request OTP
4. Check your phone for the SMS
5. Verify by entering the received OTP

**If SMS doesn't arrive:**
```bash
# Check Edge Function logs for errors
supabase functions logs send-sms-hook --tail

# Common issues:
# - SEND_SMS_HOOK_SECRET mismatch → 401 in logs
# - GATEWAY_API_URL wrong → connection errors
# - GATEWAY_API_KEY invalid → 401/403 from gateway
# - Phone format issue → check gateway docs for expected format
```

---

## 8. Production Hardening (Optional)

- [ ] Set up Supabase Dashboard alerts for function errors
- [ ] Monitor gateway SMS delivery reports
- [ ] Consider adding a fallback gateway in `sendViaGateway()` if primary fails
- [ ] Set up a monthly cost alert on your SMS gateway account

---

## Quick Reference

| Item | Value |
|------|-------|
| Function name | `send-sms-hook` |
| Function URL | `https://<ref>.supabase.co/functions/v1/send-sms-hook` |
| JWT verification | Disabled (`--no-verify-jwt`) |
| Auth method | Standard Webhooks HMAC signature |
| Retry policy | Once on 5xx/network error, never on 4xx |
| Logs | `supabase functions logs send-sms-hook` |
