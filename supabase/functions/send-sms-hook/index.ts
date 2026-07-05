// supabase/functions/send-sms-hook/index.ts
// Supabase Edge Function — Custom Send SMS Hook
// Routes OTP delivery through a Pakistani local SMS gateway
// instead of Supabase's built-in Twilio/Vonage.

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

// ============================================================================
// TYPES
// ============================================================================

interface SendSmsHookPayload {
  user: {
    id: string;
    phone: string;
    role?: string;
    aud?: string;
  };
  sms: {
    otp: string;
  };
}

interface GatewayResult {
  success: boolean;
  statusCode: number;
  body: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Mask a phone number for safe logging.
 * "+923361234567" → "+92xx-xxx-4567"
 * "03361234567"   → "03xx-xxx-4567"
 */
function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return "***";
  const last4 = phone.slice(-4);
  const prefix = phone.slice(0, phone.startsWith("+") ? 3 : 2);
  return `${prefix}xx-xxx-${last4}`;
}

/**
 * Format the OTP message body.
 */
function formatMessage(otp: string): string {
  return `Your Leo's Cafe verification code is ${otp}. Valid for 60 seconds.`;
}

// ============================================================================
// GATEWAY — ISOLATED PROVIDER LOGIC
// Edit ONLY this function when swapping SMS providers.
// ============================================================================

/**
 * Send an SMS via the configured Pakistani gateway.
 *
 * This function is intentionally generic. When you pick a provider
 * (e.g. SendSMSGate, otpsmsapi.com, ExpertTexting, MSG91), edit the
 * fetch call below to match their exact API shape.
 *
 * @param phone  - International format phone number (e.g. "+923361234567")
 * @param otp    - The OTP code to deliver
 * @returns      - { success, statusCode, body }
 */
async function sendViaGateway(
  phone: string,
  otp: string
): Promise<GatewayResult> {
  const gatewayUrl = Deno.env.get("GATEWAY_API_URL");
  const gatewayKey = Deno.env.get("GATEWAY_API_KEY");

  if (!gatewayUrl || !gatewayKey) {
    return {
      success: false,
      statusCode: 500,
      body: "GATEWAY_API_URL or GATEWAY_API_KEY not configured",
    };
  }

  const message = formatMessage(otp);

  // ──────────────────────────────────────────────────────────────────────────
  // PROVIDER-SPECIFIC: Adjust the request below to match your gateway's API.
  //
  // Example A — JSON body (e.g. SendSMSGate / otpsmsapi.com style):
  //   POST /api/send
  //   Headers: { "Authorization": "Bearer <key>", "Content-Type": "application/json" }
  //   Body: { "to": "+923...", "message": "Your code is ..." }
  //
  // Example B — Query params (e.g. ExpertTexting style):
  //   GET /api/sms/send?api_key=<key>&to=923...&text=Your+code+is+...
  //
  // Replace the fetch below with whichever format your provider uses.
  // ──────────────────────────────────────────────────────────────────────────

  const response = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ↓ PROVIDER-SPECIFIC: Change auth header name/format as needed
      Authorization: `Bearer ${gatewayKey}`,
    },
    body: JSON.stringify({
      // ↓ PROVIDER-SPECIFIC: Change field names to match your gateway's API
      to: phone,
      message: message,
      // sender_id: "LeoCafe",  // Uncomment if your provider requires a sender ID
    }),
  });

  const body = await response.text();

  return {
    success: response.ok,
    statusCode: response.status,
    body,
  };
}

// ============================================================================
// RETRY WRAPPER
// Retries once on network failure or 5xx. Does NOT retry on 4xx.
// ============================================================================

async function sendWithRetry(
  phone: string,
  otp: string
): Promise<GatewayResult> {
  let result: GatewayResult;

  try {
    result = await sendViaGateway(phone, otp);
  } catch (err) {
    // Network error — retry once
    console.warn(
      `[send-sms-hook] Network error on first attempt to ${maskPhone(phone)}: ${(err as Error).message}. Retrying...`
    );
    try {
      result = await sendViaGateway(phone, otp);
    } catch (retryErr) {
      return {
        success: false,
        statusCode: 502,
        body: `Network error after retry: ${(retryErr as Error).message}`,
      };
    }
  }

  // Retry once on 5xx
  if (result.statusCode >= 500) {
    console.warn(
      `[send-sms-hook] Gateway returned ${result.statusCode} for ${maskPhone(phone)}. Retrying once...`
    );
    try {
      const retryResult = await sendViaGateway(phone, otp);
      return retryResult;
    } catch (retryErr) {
      return {
        success: false,
        statusCode: 502,
        body: `Network error on retry after 5xx: ${(retryErr as Error).message}`,
      };
    }
  }

  return result;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req: Request): Promise<Response> => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Step 1: Read raw body (must be done BEFORE any JSON parsing) ──────────
  const rawBody = await req.text();

  // ── Step 2: Verify webhook signature ──────────────────────────────────────
  const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
  if (!hookSecret) {
    console.error("[send-sms-hook] SEND_SMS_HOOK_SECRET is not set");
    return new Response(
      JSON.stringify({ error: "Hook secret not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Supabase prefixes the secret with "v1,whsec_" — standardwebhooks expects
  // just the base64 part after "v1,whsec_".
  const cleanedSecret = hookSecret.replace(/^v\d+,whsec_/, "");

  const wh = new Webhook(cleanedSecret);

  let payload: SendSmsHookPayload;
  try {
    // standardwebhooks expects these headers:
    //   webhook-id, webhook-signature, webhook-timestamp
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    payload = wh.verify(rawBody, headers) as SendSmsHookPayload;
  } catch (err) {
    console.error(
      `[send-sms-hook] Signature verification failed: ${(err as Error).message}`
    );
    return new Response(
      JSON.stringify({ error: "Invalid webhook signature" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Step 3: Extract phone + OTP ───────────────────────────────────────────
  const phone = payload.user?.phone;
  const otp = payload.sms?.otp;

  if (!phone || !otp) {
    console.error(
      "[send-sms-hook] Missing phone or OTP in payload"
    );
    return new Response(
      JSON.stringify({ error: "Missing phone or OTP in payload" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const maskedPhone = maskPhone(phone);
  console.log(`[send-sms-hook] Sending OTP to ${maskedPhone}`);

  // ── Step 4: Send via gateway (with retry) ─────────────────────────────────
  const result = await sendWithRetry(phone, otp);

  if (result.success) {
    console.log(
      `[send-sms-hook] ✅ SMS delivered to ${maskedPhone} (gateway: ${result.statusCode})`
    );
    // Supabase expects a 200 with an empty JSON object on success
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Step 5: Handle failure ────────────────────────────────────────────────
  console.error(
    `[send-sms-hook] ❌ SMS delivery failed for ${maskedPhone} ` +
      `(gateway: ${result.statusCode}, response: ${result.body.substring(0, 200)})`
  );

  return new Response(
    JSON.stringify({
      error: "SMS delivery failed",
      details: result.body.substring(0, 500),
    }),
    {
      status: result.statusCode >= 400 ? result.statusCode : 500,
      headers: { "Content-Type": "application/json" },
    }
  );
});
