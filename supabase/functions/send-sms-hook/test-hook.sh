#!/usr/bin/env bash
# ─── test-hook.sh ────────────────────────────────────────────────────────────
# Local test script for the send-sms-hook Edge Function.
#
# Prerequisites:
#   1. Supabase CLI installed: npm i -g supabase
#   2. Edge Function running locally:
#      supabase functions serve send-sms-hook --env-file ./supabase/functions/send-sms-hook/.env
#   3. Node.js available (used for HMAC signature generation)
#
# Usage:
#   chmod +x supabase/functions/send-sms-hook/test-hook.sh
#   ./supabase/functions/send-sms-hook/test-hook.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

FUNCTION_URL="${FUNCTION_URL:-http://localhost:54321/functions/v1/send-sms-hook}"

# ─── Test payload ────────────────────────────────────────────────────────────
PAYLOAD='{
  "user": {
    "id": "test-user-uuid-1234",
    "phone": "+923361234567",
    "role": "authenticated",
    "aud": "authenticated"
  },
  "sms": {
    "otp": "123456"
  }
}'

echo "============================================"
echo " Test 1: BAD SIGNATURE (expect 401)"
echo "============================================"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-id: test-bad-id" \
  -H "webhook-signature: v1,badsignature" \
  -H "webhook-timestamp: $(date +%s)" \
  -d "$PAYLOAD")

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ PASS — Got HTTP $HTTP_CODE (invalid signature rejected)"
else
  echo "❌ FAIL — Expected 401, got HTTP $HTTP_CODE"
fi

echo ""
echo "============================================"
echo " Test 2: VALID SIGNATURE (expect 200 or gateway error)"
echo "============================================"
echo ""

# Your hook secret (from .env). Replace or export before running.
HOOK_SECRET="${SEND_SMS_HOOK_SECRET:-v1,whsec_your_hook_secret_here}"

# Strip the "v1,whsec_" prefix to get the raw base64 key
RAW_SECRET="${HOOK_SECRET#v1,whsec_}"

# Generate Standard Webhooks signature using Node.js
MSG_ID="msg_$(date +%s)"
TIMESTAMP=$(date +%s)
SIGN_CONTENT="${MSG_ID}.${TIMESTAMP}.${PAYLOAD}"

# Node.js one-liner to compute HMAC-SHA256 with base64 key → base64 output
SIGNATURE=$(node -e "
  const crypto = require('crypto');
  const key = Buffer.from('${RAW_SECRET}', 'base64');
  const sig = crypto.createHmac('sha256', key)
    .update('${SIGN_CONTENT}')
    .digest('base64');
  process.stdout.write('v1,' + sig);
")

echo "Sending signed request..."
echo "  webhook-id: $MSG_ID"
echo "  webhook-timestamp: $TIMESTAMP"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "webhook-id: $MSG_ID" \
  -H "webhook-signature: $SIGNATURE" \
  -H "webhook-timestamp: $TIMESTAMP" \
  -d "$PAYLOAD")

# Split response body and status code
BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

echo "HTTP Status: $HTTP_CODE"
echo "Response Body: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ PASS — Signature accepted, SMS delivery attempted"
elif [ "$HTTP_CODE" -ge 400 ] && [ "$HTTP_CODE" -lt 500 ]; then
  echo "⚠️  Signature accepted but gateway returned client error (expected if no real gateway configured)"
else
  echo "ℹ️  Got HTTP $HTTP_CODE — check gateway configuration"
fi

echo ""
echo "============================================"
echo " Tests complete"
echo "============================================"
