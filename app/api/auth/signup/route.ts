/**
 * POST /api/auth/signup
 * Server-side signup that bypasses CAPTCHA using service role key
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password, name, phone, birthday } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user in Supabase auth using admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email to simplify flow
      user_metadata: {
        full_name: name,
        phone,
        birthday,
      }
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Sync to Prisma database immediately
    try {
      await prisma.user.create({
        data: {
          clerkId: authData.user.id, // Using clerkId field to store Supabase UUID
          email: authData.user.email!,
          name: name || null,
          role: "user",
          birthday: birthday ? new Date(birthday) : null,
        }
      });
    } catch (dbError) {
      console.error("Failed to sync user to database:", dbError);
      // We don't fail the request here, but log it. The webhook should ideally handle it,
      // but creating it here ensures they exist immediately.
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
