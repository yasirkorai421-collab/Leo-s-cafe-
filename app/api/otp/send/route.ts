import { NextResponse } from "next/server";
import { z } from "zod";
import { createOtpChallenge, maskPhone, normalizePhoneNumber } from "@/lib/otp-store";
import { sendOTPSMS } from "@/lib/sms";

const otpSendSchema = z.object({
  phone: z.string().min(7).max(20),
  csrfToken: z.string().min(1),
});

function validateCsrfToken(request: Request, submittedToken: string): boolean {
  const headerToken = request.headers.get("x-csrf-token") || "";
  const cookieToken = request.headers.get("cookie")?.match(/leo_csrf=([^;]+)/)?.[1] || "";
  return Boolean(submittedToken && (headerToken === submittedToken || cookieToken === submittedToken));
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
      console.warn("[otp/send] ⚠️ RATE LIMITED:", maskPhone(normalizedPhone), "- Too many requests");
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    console.log("[otp/send] Sending OTP code...");
    const sent = await sendOTPSMS(normalizedPhone, challenge.otpCode);
    console.log("[otp/send] OTP send result:", sent);

    if (!sent.success) {
      if (process.env.NODE_ENV === "development") {
        console.info("[otp] 🔒 Development OTP Code for %s: %s (expires in 5 minutes)", maskPhone(normalizedPhone), challenge.otpCode);
        return NextResponse.json({ 
          success: true, 
          message: "Verification code prepared (dev mode).",
          devOtp: challenge.otpCode, // Only in development
        });
      }

      // In production, return success even if SMS fails (security - don't leak phone validity)
      console.error("[otp/send] SMS failed but returning success for security");
      return NextResponse.json(
        { success: true, message: "If the number is valid, a verification code has been sent." },
        { status: 200 }
      );
    }

    console.info("[otp] ✅ OTP sent to %s via %s", maskPhone(normalizedPhone), sent.provider);

    return NextResponse.json({
      success: true,
      message: `Verification code sent via ${sent.provider}.`,
      provider: sent.provider,
    });
  } catch (error) {
    console.error("[otp/send] Route error:", error);
    return NextResponse.json(
      { error: "Unable to send verification code right now." },
      { status: 500 }
    );
  }
}
