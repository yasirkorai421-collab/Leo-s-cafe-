import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Verify Supabase webhook signature
 * @see https://supabase.com/docs/guides/database/webhooks#payload-signature
 */
function verifySupabaseSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  try {
    // Supabase sends signature in format: v1=<hmac_signature>
    const [version, hmacSignature] = signature.split("=");
    
    if (version !== "v1" || !hmacSignature) {
      console.error("[webhook] Invalid signature format");
      return false;
    }

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(hmacSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("[webhook] Signature verification error:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // SECURITY: Verify Supabase webhook signature
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error("[webhook] SUPABASE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-supabase-signature");

    // Verify signature
    if (!verifySupabaseSignature(rawBody, signature, webhookSecret)) {
      console.error("[webhook] Invalid signature");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse body after verification
    const body = JSON.parse(rawBody);

    // Supabase auth.users insert payload
    if (body.type === "INSERT" && body.table === "users" && body.schema === "auth") {
      const user = body.record;

      await prisma.user.create({
        data: {
          id: user.id, // Supabase UUID
          clerkId: user.id, // Map Supabase auth ID to clerkId field (for compatibility)
          email: user.email,
          phone: `supa_${user.id.substring(0, 8)}`, // Generate a dummy unique phone
          name: user.raw_user_meta_data?.full_name || "New User",
          role: "user", // Default role must be 'user' not 'customer'
        },
      });
      
      return NextResponse.json({ message: "User created in Prisma" });
    }

    if (body.type === "UPDATE" && body.table === "users" && body.schema === "auth") {
      const user = body.record;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email,
          name: user.raw_user_meta_data?.full_name || undefined,
        },
      });

      return NextResponse.json({ message: "User updated in Prisma" });
    }

    if (body.type === "DELETE" && body.table === "users" && body.schema === "auth") {
      const user = body.old_record;
      
      await prisma.user.delete({
        where: { id: user.id },
      });

      return NextResponse.json({ message: "User deleted in Prisma" });
    }

    return NextResponse.json({ message: "Ignored event" });
  } catch (error: any) {
    console.error("[webhook] Supabase webhook error:", error);
    
    // Don't leak internal error details to prevent information disclosure
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
