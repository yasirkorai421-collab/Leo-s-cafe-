/**
 * Waiting for WhatsApp Confirmation Screen - ENHANCED UX
 * Fully responsive, animated, and user-friendly
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface WaitingForConfirmationProps {
  orderId: string;
  customerPhone: string;
  orderItems: OrderItem[];
  totalPrice: number;
}

export default function WaitingForConfirmation({
  orderId,
  customerPhone,
  orderItems,
  totalPrice,
}: WaitingForConfirmationProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'waiting' | 'confirmed' | 'cancelled' | 'expired'>('waiting');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isLoading, setIsLoading] = useState(false);

  const checkOrderStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/status/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch status');

      const order = await response.json();

      if (order.status === 'confirmed') {
        setStatus('confirmed');
        setTimeout(() => router.push('/orders'), 2000);
      } else if (order.status === 'cancelled') {
        setStatus('cancelled');
      } else if (order.status === 'expired') {
        setStatus('expired');
      }
    } catch (error) {
      console.error('Error checking order status:', error);
    }
  }, [orderId, router]);

  useEffect(() => {
    // Poll order status every 3 seconds
    const pollInterval = setInterval(checkOrderStatus, 3000);

    // Countdown timer
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, [checkOrderStatus]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / 300) * 100;

  const handleOpenWhatsApp = () => {
    setIsLoading(true);
    const cleanPhone = customerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=YES`, '_blank');
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {status === 'waiting' && (
          <>
            {/* Header with animated icon */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 sm:p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 animate-pulse">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                WhatsApp Confirmation
              </h1>
              <p className="text-green-100 text-sm sm:text-base">
                We sent you a message. Reply <strong className="text-white">YES</strong> to confirm!
              </p>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 md:p-8">
              {/* Phone number display */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 sm:mb-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">Sent to:</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-gray-800">{customerPhone}</p>
              </div>

              {/* Order summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm sm:text-base font-semibold text-gray-700">Your Order</span>
                </div>
                <div className="space-y-2 mb-3">
                  {orderItems.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-start text-xs sm:text-sm">
                      <span className="text-gray-700 flex-1">
                        <span className="inline-block w-5 text-gray-400">{index + 1}.</span>
                        {item.name} <span className="text-gray-500">x{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-800 ml-2">Rs.{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-blue-200 flex justify-between items-center">
                  <span className="text-sm sm:text-base font-bold text-gray-800">Total</span>
                  <span className="text-lg sm:text-xl font-bold text-blue-600">Rs.{totalPrice}</span>
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Time remaining</p>
                <div className="inline-flex items-center justify-center gap-2 bg-yellow-50 rounded-xl px-6 py-3 border-2 border-yellow-200">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-2xl sm:text-3xl font-bold text-yellow-700">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ⏱️ Offer expires in {minutes} min {seconds} sec
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleOpenWhatsApp}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      Open WhatsApp
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.push('/profile/settings')}
                  className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 text-sm sm:text-base"
                >
                  Update Phone Number
                </button>
              </div>

              {/* Help text */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  <strong>Didn't receive the message?</strong><br/>
                  Check your WhatsApp, tap the button above, or update your number
                </p>
              </div>
            </div>
          </>
        )}

        {status === 'confirmed' && (
          <div className="p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 animate-bounce">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-3">
              Order Confirmed! 🎉
            </h2>
            <p className="text-gray-600 mb-2 text-sm sm:text-base">
              Your order has been sent to the kitchen.
            </p>
            <p className="text-sm text-gray-500">
              You'll receive updates shortly...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-green-200 border-t-green-600 rounded-full"></div>
            </div>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-3">
              Order Cancelled
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Your order was cancelled. Please update your phone number and try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/profile/settings')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
              >
                Update Phone Number
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-6">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-3">
              Time's Up! ⏰
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              The confirmation window has closed. Please place a new order.
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
            >
              Place New Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
