/**
 * Delivery Personnel Login Page - /delivery/login
 * Authentication for delivery riders
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";

export default function DeliveryLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user is delivery person
      const { data: dbUser } = await supabase
        .from("users")
        .select("role")
        .eq("clerk_id", user.id)
        .single();

      if (dbUser?.role === "delivery_person") {
        router.push("/delivery/dashboard");
        return;
      } else {
        // Sign out if not delivery person
        await supabase.auth.signOut();
      }
    }
    
    setCheckingAuth(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Authentication failed");
      }

      // Verify user is delivery person
      const { data: dbUser, error: dbError } = await supabase
        .from("users")
        .select("role, name")
        .eq("clerk_id", data.user.id)
        .single();

      if (dbError || !dbUser) {
        await supabase.auth.signOut();
        throw new Error("User not found in database");
      }

      if (dbUser.role !== "delivery_person") {
        await supabase.auth.signOut();
        throw new Error("Access denied. Delivery personnel credentials required.");
      }

      toast.success(`Welcome back, ${dbUser.name}!`);
      
      // Redirect to delivery dashboard
      const redirect = searchParams?.get("redirect") || "/delivery/dashboard";
      router.push(redirect);
    } catch (error: any) {
      console.error("Delivery login error:", error);
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Branding */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            🚚
          </div>
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          Delivery Portal
        </h2>
        <p className="text-center text-sm text-gray-600">
          Sign in to manage your deliveries
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="rider@leoscafe.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          {/* Info Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Delivery Info</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-600 bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">📱</span>
                <span>Use the email and password provided by admin</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">🔒</span>
                <span>Keep your login credentials secure</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">📦</span>
                <span>Update delivery status in real-time</span>
              </p>
            </div>
          </div>

          {/* Back to Site */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to Main Site
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            Need help? Contact admin at{" "}
            <a href="mailto:admin@leoscafe.com" className="text-blue-600 hover:underline">
              admin@leoscafe.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
