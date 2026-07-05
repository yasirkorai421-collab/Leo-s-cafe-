import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtpChallenge, normalizePhoneNumber, maskPhone } from "@/lib/otp-store";

const otpVerifySchema = z.object({
  phone: z.string().min(7).max(20),
  otp: z.string().length(6),
  csrfToken: z.string().min(1),
});

function validateCsrfToken(request: Request, submittedToken: string): boolean {
  const headerToken = request.headers.get("x-csrf-token") || "";
  const cookieToken = request.headers.get("cookie")?.match(/leo_csrf=([^;]+)/)?.[1] || "";
  return Boolean(submittedToken && (headerToken === submittedToken || cookieToken === submittedToken));
}

export async function POST(request: Request) {
  try {
    console.log("[otp/verify] Request received");
    const body = await request.json().catch(() => ({}));
    console.log("[otp/verify] Body parsed");
    const parsed = otpVerifySchema.safeParse(body);
    console.log("[otp/verify] Schema validation:", parsed.success);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { phone, otp, csrfToken } = parsed.data;

    if (!csrfToken || !validateCsrfToken(request, csrfToken)) {
      console.log("[otp/verify] CSRF validation failed");
      return NextResponse.json({ error: "CSRF token missing" }, { status: 403 });
    }

    console.log("[otp/verify] Normalizing phone...");
    const normalizedPhone = normalizePhoneNumber(phone);
    
    console.log("[otp/verify] Verifying OTP...");
    const result = await verifyOtpChallenge(normalizedPhone, otp);
    console.log("[otp/verify] Verification result:", result.success);

    if (!result.success) {
      return NextResponse.json(
        { error: result.locked ? "Too many incorrect attempts. Please request a new code." : "Invalid verification code." },
        { status: 400 }
      );
    }

    console.log("[otp/verify] Updating user phoneVerifiedAt...");
    const { prisma } = await import("@/lib/prisma");
    await prisma.user.updateMany({
      where: { phone: normalizedPhone },
      data: { phoneVerifiedAt: new Date() },
    });

    console.info("[otp] Verified phone %s", maskPhone(normalizedPhone));

    return NextResponse.json({ success: true, message: "Phone verified successfully." });
  } catch (error) {
    console.error("[otp/verify] Route error:", error);
    return NextResponse.json(
      { error: "Unable to verify your code right now." },
      { status: 500 }
    );
  }
}
