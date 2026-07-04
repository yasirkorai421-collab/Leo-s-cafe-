import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Create user in database if doesn't exist (OAuth users)
      try {
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: data.user.id },
        });

        if (!existingUser) {
          // Extract user details from OAuth providers
          const name = data.user.user_metadata?.full_name || 
                      data.user.user_metadata?.name || 
                      data.user.email?.split('@')[0] || 
                      'User';
          
          const phone = data.user.user_metadata?.phone || 
                       data.user.phone || 
                       `oauth_${data.user.id.slice(0, 8)}`;

          await prisma.user.create({
            data: {
              clerkId: data.user.id,
              name,
              phone,
              email: data.user.email,
              role: 'user',
            },
          });
        }
      } catch (dbError) {
        console.error('Failed to sync OAuth user to database:', dbError);
        // Continue anyway - user can still use the app
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/`);
}

