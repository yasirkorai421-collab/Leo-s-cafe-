/**
 * Phone Number Input Component for Signup
 * Auto-formats Pakistani phone numbers
 */

'use client';

import { useState } from 'react';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export default function PhoneNumberInput({
  value,
  onChange,
  error,
  required = true,
}: PhoneNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const formatPhoneInput = (inputValue: string) => {
    const digits = inputValue.replace(/\D/g, '');

    // Convert 03001234567 to +923001234567
    if (digits.startsWith('03')) {
      return '+92' + digits.substring(1);
    }
    // If already has 923
    else if (digits.startsWith('923')) {
      return '+' + digits;
    }
    // If has 92 but no +
    else if (digits.startsWith('92')) {
      return '+' + digits;
    }

    return inputValue;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    onChange(formatted);
  };

  const validateFormat = (val: string): boolean => {
    return /^\+92\d{10}$/.test(val);
  };

  const isValid = value.length === 0 || validateFormat(value);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Phone Number {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          📱
        </div>
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="+923001234567"
          className={`w-full pl-10 pr-4 py-2 border rounded-lg transition ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : isValid
              ? 'border-gray-300 focus:ring-green-500'
              : 'border-yellow-500 focus:ring-yellow-500'
          } focus:outline-none focus:ring-2`}
        />
        {!error && value.length > 0 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <span className="text-green-500 text-lg">✓</span>
            ) : (
              <span className="text-yellow-500 text-lg">⚠</span>
            )}
          </div>
        )}
      </div>

      {isFocused && (
        <div className="text-xs text-gray-600 mt-2 space-y-1">
          <p>💡 Accepted formats:</p>
          <ul className="ml-3 list-disc">
            <li>+923001234567</li>
            <li>03001234567 (will auto-convert to +923001234567)</li>
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      {!error && value.length > 0 && !isValid && (
        <p className="text-sm text-yellow-600 mt-2">
          Format: +92 followed by 10 digits
        </p>
      )}
    </div>
  );
}
