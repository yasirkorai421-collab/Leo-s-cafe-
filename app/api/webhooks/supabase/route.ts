import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // Basic verification - you should configure a Webhook Secret in Supabase 
    // and verify the authorization header in a real production environment.
    // For local dev, we will accept the payload.
    
    const body = await req.json();

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
    console.error("Supabase webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
