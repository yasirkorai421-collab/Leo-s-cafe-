'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";

interface FormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  numberOfPeople: number;
  specialRequest: string;
}

export default function ReservationForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    numberOfPeople: 2,
    specialRequest: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    setCheckingAuth(false);
    
    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "numberOfPeople" ? parseInt(value) || 0 : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      newErrors.phone = "Valid phone number is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Date must be today or in the future";
      }
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (!formData.numberOfPeople || formData.numberOfPeople < 1) {
      newErrors.numberOfPeople = "Number of guests is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to make a reservation");
      router.push(`/auth/login?redirect=/reservation`);
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create reservation");
      }

      toast.success("Reservation request submitted! We'll confirm shortly.");
      
      // Reset form
      setFormData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: "",
        time: "",
        numberOfPeople: 2,
        specialRequest: "",
      });

      // Optionally redirect to reservations page
      setTimeout(() => {
        router.push("/my-reservations");
      }, 2000);
    } catch (error: any) {
      console.error("Reservation error:", error);
      toast.error(error.message || "Failed to submit reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get min date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <>
      {/* Dark photo banner with decorative 3-part heading */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=60&w=1200&h=600&fit=crop&auto=format"
            alt="Book a Table"
            fill
            sizes="100vw"
            quality={60}
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/55 z-10" />
        </div>

        <div className="relative z-20 container mx-auto px-4 text-center">
          {/* "Book a" — script, top-left offset */}
          <span
            className="font-script block text-accent"
            style={{ fontSize: "2.75rem", lineHeight: 1, opacity: 0.9, marginBottom: "-1rem" }}
          >
            Book a
          </span>
          {/* "Reservation" — bold heading, center */}
          <h2
            className="font-heading font-bold text-white inline-block relative z-10"
            style={{ fontSize: "2.25rem", marginTop: 0 }}
          >
            Reservation
          </h2>
          {/* "table" — script, bottom-right offset */}
          <span
            className="font-script block text-accent"
            style={{ fontSize: "2.75rem", lineHeight: 1, opacity: 0.9, marginTop: "-0.75rem" }}
          >
            table
          </span>
        </div>
      </section>

      {/* Form body — white bg, pulled up to overlap photo band */}
      <section className="pb-20" style={{ background: "var(--bg-page)" }}>
        <div className="container mx-auto px-4">
          <div
            className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-lg -mt-10 relative z-20"
          >
            {!isAuthenticated && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You need to be logged in to make a reservation.{" "}
                  <button
                    onClick={() => router.push(`/auth/login?redirect=/reservation`)}
                    className="underline font-semibold hover:text-yellow-900"
                  >
                    Login here
                  </button>
                </p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="res-name"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="res-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    className={`w-full border px-4 py-3 focus:outline-none transition-colors ${
                      errors.name ? "border-red-500" : ""
                    }`}
                    style={{
                      borderColor: errors.name ? "#ef4444" : "var(--color-border-light)",
                      color: "var(--color-body-gray)",
                    }}
                    onFocus={(e) => !errors.name && (e.target.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => !errors.name && (e.target.style.borderColor = "var(--color-border-light)")}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="res-email"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="res-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={`w-full border px-4 py-3 focus:outline-none transition-colors ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    style={{
                      borderColor: errors.email ? "#ef4444" : "var(--color-border-light)",
                      color: "var(--color-body-gray)",
                    }}
                    onFocus={(e) => !errors.email && (e.target.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => !errors.email && (e.target.style.borderColor = "var(--color-border-light)")}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="res-phone"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="res-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="03001234567"
                    className={`w-full border px-4 py-3 focus:outline-none transition-colors ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                    style={{
                      borderColor: errors.phone ? "#ef4444" : "var(--color-border-light)",
                      color: "var(--color-body-gray)",
                    }}
                    onFocus={(e) => !errors.phone && (e.target.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => !errors.phone && (e.target.style.borderColor = "var(--color-border-light)")}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="res-date"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="res-date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    className={`w-full border px-4 py-3 focus:outline-none transition-colors ${
                      errors.date ? "border-red-500" : ""
                    }`}
                    style={{
                      borderColor: errors.date ? "#ef4444" : "var(--color-border-light)",
                      color: "var(--color-body-gray)",
                    }}
                    onFocus={(e) => !errors.date && (e.target.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => !errors.date && (e.target.style.borderColor = "var(--color-border-light)")}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>

                {/* Time */}
                <div>
                  <label
                    htmlFor="res-time"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="res-time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className={`w-full border px-4 py-3 focus:outline-none transition-colors ${
                      errors.time ? "border-red-500" : ""
                    }`}
                    style={{
                      borderColor: errors.time ? "#ef4444" : "var(--color-border-light)",
                      color: "var(--color-body-gray)",
                    }}
                    onFocus={(e) => !errors.time && (e.target.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => !errors.time && (e.target.style.borderColor = "var(--color-border-light)")}
                  />
                  {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                </div>

                {/* Number of People */}
                <div>
                  <label
                    htmlFor="res-person"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Number of Guests <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="res-person"
                      name="numberOfPeople"
                      value={formData.numberOfPeople}
                      onChange={handleInputChange}
                      className={`w-full border px-4 py-3 focus:outline-none appearance-none bg-white pr-10 transition-colors ${
                        errors.numberOfPeople ? "border-red-500" : ""
                      }`}
                      style={{
                        borderColor: errors.numberOfPeople ? "#ef4444" : "var(--color-border-light)",
                        color: "var(--color-body-gray)",
                      }}
                      onFocus={(e) => !errors.numberOfPeople && (e.target.style.borderColor = "var(--color-accent)")}
                      onBlur={(e) => !errors.numberOfPeople && (e.target.style.borderColor = "var(--color-border-light)")}
                    >
                      <option value="">Select guests</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                      <option value="15">15+ Guests</option>
                      <option value="20">20+ Guests</option>
                    </select>
                    {/* Chevron icon */}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-label-gray">
                      ▾
                    </span>
                  </div>
                  {errors.numberOfPeople && <p className="text-red-500 text-xs mt-1">{errors.numberOfPeople}</p>}
                </div>
              </div>

              {/* Special Request */}
              <div className="pt-2">
                <label
                  htmlFor="special-request"
                  className="block font-heading font-bold text-black text-sm mb-2"
                >
                  Special Requests <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="special-request"
                  name="specialRequest"
                  value={formData.specialRequest}
                  onChange={handleInputChange}
                  placeholder="Any special requests? (e.g., window seat, birthday celebration, dietary requirements)"
                  rows={3}
                  maxLength={500}
                  className="w-full border px-4 py-3 focus:outline-none transition-colors resize-none"
                  style={{
                    borderColor: "var(--color-border-light)",
                    color: "var(--color-body-gray)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border-light)")}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formData.specialRequest.length}/500 characters
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isAuthenticated}
                className={`w-full text-white font-bold py-4 mt-6 uppercase tracking-wider transition-all ${
                  isSubmitting || !isAuthenticated ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{ 
                  background: isSubmitting || !isAuthenticated ? "#999" : "var(--color-accent)", 
                  marginTop: "1.5rem" 
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && isAuthenticated) {
                    (e.target as HTMLButtonElement).style.background = "var(--color-accent-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && isAuthenticated) {
                    (e.target as HTMLButtonElement).style.background = "var(--color-accent)";
                  }
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Make a Reservation"
                )}
              </button>

              {/* Info Note */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Note:</strong> Your reservation request will be reviewed by our team. 
                  We'll send you a confirmation message within a few hours. You can track your 
                  reservation status in your account.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
