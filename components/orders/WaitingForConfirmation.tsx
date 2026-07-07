/**
 * Waiting for WhatsApp Confirmation Screen
 * Shows when user places order and needs to confirm via WhatsApp
 */

'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    // Poll order status every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/status/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch status');

        const order = await response.json();

        if (order.status === 'confirmed') {
          setStatus('confirmed');
          clearInterval(pollInterval);
          setTimeout(() => router.push('/'), 2000);
        } else if (order.status === 'cancelled') {
          setStatus('cancelled');
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    }, 3000);

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
  }, [orderId, router]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'waiting' && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="w-8 h-8 text-green-600 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                WhatsApp Confirmation Needed
              </h1>
              <p className="text-gray-600">
                We sent you a message on WhatsApp. Please reply <strong>YES</strong> to confirm your order.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 mb-3">
                <strong>Sent to:</strong> {customerPhone}
              </p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Order Summary:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {orderItems.map((item) => (
                    <li key={item.id}>
                      {item.name} x{item.quantity} - Rs.{item.price}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-bold text-gray-800 pt-2 border-t">
                  Total: Rs.{totalPrice}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Waiting for your WhatsApp reply...
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold text-green-600">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-sm text-gray-500">remaining</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                ⏱️ This offer expires in 5 minutes
              </p>
              <a
                href={`https://wa.me/${customerPhone.replace(/\D/g, '')}?text=YES`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
              >
                Open WhatsApp
              </a>
            </div>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-bounce">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Order Confirmed! ✅
              </h2>
              <p className="text-gray-600">
                Your order has been sent to the kitchen. You'll receive updates shortly.
              </p>
            </div>

            <p className="text-sm text-gray-500">
              Redirecting to home page...
            </p>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Order Cancelled
              </h2>
              <p className="text-gray-600">
                Your order has been cancelled. Please update your phone number and try again.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="/profile/settings"
                className="block w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
              >
                Update Phone Number
              </a>
              <a
                href="/"
                className="block w-full py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
              >
                Back to Home
              </a>
            </div>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-yellow-600 mb-2">
                Request Expired
              </h2>
              <p className="text-gray-600">
                The confirmation request has expired. Please place a new order.
              </p>
            </div>

            <a
              href="/"
              className="block w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
            >
              Place New Order
            </a>
          </>
        )}
      </div>
    </div>
  );
}
