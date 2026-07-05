import { NextResponse } from "next/server";
import { z } from "zod";
import { createOtpChallenge, maskPhone, normalizePhoneNumber } from "@/lib/otp-store";

const otpSendSchema = z.object({
  phone: z.string().min(7).max(20),
  csrfToken: z.string().min(1),
});

function validateCsrfToken(request: Request, submittedToken: string): boolean {
  const headerToken = request.headers.get("x-csrf-token") || "";
  const cookieToken = request.headers.get("cookie")?.match(/leo_csrf=([^;]+)/)?.[1] || "";
  return Boolean(submittedToken && (headerToken === submittedToken || cookieToken === submittedToken));
}

async function sendOtpViaMSG91(phone: string, otpCode: string): Promise<boolean> {
  const apiKey = process.env.MSG91_API_KEY;
  const senderId = process.env.MSG91_SENDER_ID || "LEOCAFE";

  if (!apiKey) {
    return false;
  }

  const response = await fetch("https://control.msg91.com/api/v5/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: apiKey,
    },
    body: JSON.stringify({
      mobile: phone.replace(/^\+/, ""),
      otp: otpCode,
      sender: senderId,
      authkey: apiKey,
    }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json().catch(() => null);
  return Boolean(data && data.type === "success");
}

async function sendOtpViaTwilio(phone: string, otpCode: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return false;
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: `Your Leo's Cafe verification code is ${otpCode}. Valid for 5 minutes.`,
      }),
    }
  );

  return response.ok;
}

async function sendOtpCode(phone: string, otpCode: string): Promise<{ success: boolean; method: string }> {
  const msg91Success = await sendOtpViaMSG91(phone, otpCode);
  if (msg91Success) {
    return { success: true, method: "MSG91" };
  }

  const twilioSuccess = await sendOtpViaTwilio(phone, otpCode);
  if (twilioSuccess) {
    return { success: true, method: "Twilio" };
  }

  return { success: false, method: "" };
}

export async function POST(request: Request) {
  try {
    console.log("[otp/send] Request received");
    const body = await request.json().catch(() => ({}));
    console.log("[otp/send] Body parsed:", body);
    const parsed = otpSendSchema.safeParse(body);
    console.log("[otp/send] Schema validation result:", parsed.success);

    if (!parsed.success) {
      console.log("[otp/send] Schema validation failed:", parsed.error);
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { phone, csrfToken } = parsed.data;
    console.log("[otp/send] Phone:", phone, "Token:", csrfToken);

    if (!csrfToken || !validateCsrfToken(request, csrfToken)) {
      console.log("[otp/send] CSRF validation failed");
      return NextResponse.json({ error: "CSRF token missing" }, { status: 403 });
    }

    console.log("[otp/send] Normalizing phone...");
    const normalizedPhone = normalizePhoneNumber(phone);
    console.log("[otp/send] Normalized phone:", normalizedPhone);
    
    console.log("[otp/send] Creating OTP challenge...");
    const challenge = await createOtpChallenge(normalizedPhone, {
      ttlMs: 5 * 60 * 1000,
      maxAttempts: 5,
      rateLimitWindowMs: 15 * 60 * 1000,
      maxRequests: 3,
    });
    console.log("[otp/send] Challenge created:", challenge.id);

    if (challenge.rateLimited) {
      console.log("[otp/send] Rate limited");
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    console.log("[otp/send] Sending OTP code...");
    const sent = await sendOtpCode(normalizedPhone, challenge.otpCode);
    console.log("[otp/send] OTP send result:", sent);

    if (!sent.success) {
      if (process.env.NODE_ENV === "development") {
        console.info("[otp] 🔒 Development OTP Code for %s: %s (expires in 5 minutes)", maskPhone(normalizedPhone), challenge.otpCode);
        return NextResponse.json({ success: true, message: "Verification code prepared." });
      }

      return NextResponse.json(
        { success: true, message: "If the number is valid, a verification code has been sent." },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
      method: sent.method,
    });
  } catch (error) {
    console.error("[otp/send] Route error:", error);
    return NextResponse.json(
      { error: "Unable to send verification code right now." },
      { status: 500 }
    );
  }
}
