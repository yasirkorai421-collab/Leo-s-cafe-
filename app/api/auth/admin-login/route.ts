/**
 * POST /api/auth/admin-login
 * Admin login endpoint that bypasses CAPTCHA using service role key
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Use service role client to bypass CAPTCHA
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Sign in with admin client (bypasses CAPTCHA)
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Login failed" },
        { status: 401 }
      );
    }

    // Check admin role from database
    const adminEmail = process.env.ADMIN_EMAIL || "yasiradmin123@gmail.com";
    
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: data.user.id },
        select: { role: true },
      });
      
      if (!dbUser || dbUser.role !== "admin") {
        return NextResponse.json(
          { error: "Access denied. Admin access only." },
          { status: 403 }
        );
      }
    } catch (dbError) {
      // If DB check fails, fall back to email check against env var
      console.warn("DB check failed, falling back to email check:", dbError);
      if (data.user.email !== adminEmail) {
        return NextResponse.json(
          { error: "Access denied. Admin access only." },
          { status: 403 }
        );
      }
    }

    // Return session data
    return NextResponse.json({
      success: true,
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
