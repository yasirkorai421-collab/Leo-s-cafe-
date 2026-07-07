/**
 * Phone Number Settings Component
 * Allows users to view and update their phone number
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface PhoneNumberSettingsProps {
  currentPhone: string;
  isVerified: boolean;
}

export default function PhoneNumberSettings({
  currentPhone,
  isVerified,
}: PhoneNumberSettingsProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(currentPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Auto-format phone number: convert 03001234567 to +923001234567
  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.startsWith('03')) {
      return '+92' + digits.substring(1);
    } else if (digits.startsWith('923')) {
      return '+' + digits;
    } else if (digits.startsWith('92')) {
      return '+' + digits;
    }
    
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhone(formatted);
  };

  const validatePhone = (value: string): boolean => {
    const regex = /^\+92\d{10}$/;
    return regex.test(value);
  };

  const handleUpdate = async () => {
    if (!validatePhone(phone)) {
      toast.error('Invalid Pakistani phone number format');
      return;
    }

    if (phone === currentPhone) {
      toast.error('Please enter a different phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update phone number');
      }

      toast.success('Phone number updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update phone');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPhone(currentPhone);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Phone Number</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-gray-700">{currentPhone}</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isVerified
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {isVerified ? '✓ Verified' : 'Not verified'}
            </span>
          </div>
          {!isVerified && (
            <p className="text-sm text-gray-600">
              Your phone number will be verified when you place your first order via WhatsApp confirmation.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+923001234567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: +92xxxxxxxxxx or 03xxxxxxxxx (will auto-convert)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              ℹ️ You can update your phone number if your previous one was incorrect or if an order failed.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
            >
              {isLoading ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
