/**
 * Email Verification Page
 * Guides users through email verification process
 */

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function VerifyEmailPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Check if email is already verified
  const { data: { user: authUser } } = await supabase.auth.admin.getUserById(user.id);
  
  if (authUser?.email_confirmed_at) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Email Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email address.
        </p>

        {/* Email Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-600 mb-1">Email address:</p>
          <p className="text-lg font-semibold text-gray-900 break-all">{user.email}</p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-3">What to do:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Check your email inbox</li>
            <li>Click the verification link</li>
            <li>You'll be confirmed automatically</li>
            <li>Return here to continue</li>
          </ol>
        </div>

        {/* Check Status Button */}
        <button
          onClick={() => window.location.reload()}
          className="w-full py-2 px-4 mb-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          Check Verification Status
        </button>

        {/* Resend Link */}
        <button
          onClick={() => {
            alert("Please check your email for the verification link. If you haven't received it, try signing up again.");
            window.location.href = '/auth/signup';
          }}
          className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
        >
          Resend Verification Link
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Help Text */}
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>Didn't receive the email?</strong>
          </p>
          <ul className="space-y-2 text-left">
            <li>✓ Check your spam/promotions folder</li>
            <li>✓ Check if the email address is correct</li>
            <li>✓ Try resending the link above</li>
          </ul>
        </div>

        {/* Contact Support */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Need help?</p>
          <a
            href="mailto:support@leoscafe.com"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Contact Support
          </a>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
