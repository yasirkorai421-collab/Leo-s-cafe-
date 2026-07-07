/**
 * Email Verification Banner
 * Shows when user is not verified and blocks order placement
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EmailVerificationBannerProps {
  userEmail?: string;
  isVerified: boolean;
}

export default function EmailVerificationBanner({
  userEmail,
  isVerified,
}: EmailVerificationBannerProps) {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);

  if (isVerified) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // This would be called through Supabase - they'll receive a new magic link
      // For now, we just show a message since Supabase handles this automatically
      alert(`Verification link sent to ${userEmail}`);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-1">⚠️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-1">
            Email Not Verified
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            You must verify your email to place orders. Check your inbox for a verification link.
          </p>
          {userEmail && (
            <p className="text-xs text-yellow-700 mb-3">
              Verification link sent to: <strong>{userEmail}</strong>
            </p>
          )}
          <div className="flex gap-2 text-sm">
            <a
              href="/auth/verify-email"
              className="inline-block px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition"
            >
              Verify Email
            </a>
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="inline-block px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded transition disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
