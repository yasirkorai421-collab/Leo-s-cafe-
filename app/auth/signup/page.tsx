import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default function SignUpPage() {
  const signUp = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // For development, you might not require email verification
        // But if you do, set up a proper redirect URL
        emailRedirectTo: "http://localhost:3000/auth/callback",
      },
    });

    if (error) {
      return redirect("/auth/signup?message=Could not create account");
    }

    // You can redirect to a check-email page or directly to login
    return redirect("/auth/login?message=Check email to continue sign in process");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-heading mb-2">Create Account</h1>
          <p className="text-muted-foreground text-sm">Sign up to get started</p>
        </div>
        
        <form action={signUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              name="email"
              id="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:opacity-90 transition-opacity">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <a href="/auth/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
