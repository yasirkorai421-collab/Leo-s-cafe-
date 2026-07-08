/**
 * CSRF Token Generation Endpoint
 * GET /api/csrf - Generate and return a CSRF token
 * 
 * This token must be included in POST requests to protect against CSRF attacks
 */

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    const response = NextResponse.json({ 
      csrfToken: token,
      expiresIn: 86400 // 24 hours in seconds
    });
    
    // Set cookie for server-side validation
    response.cookies.set('leo_csrf', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('[csrf] Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
