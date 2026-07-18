"use client";

import React, { useState } from "react";
import { AuthCard, Button, Input, LoadingPulse } from "@repo/ui";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Typically we'd call signUpWithEmail from useAuth here
      // Simulated for Stage 1 as requested if real sign-up isn't hooked yet,
      // but let's assume it works via supabase client directly or a hook.
      
      // Simulate network request for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);

    } catch (err: unknown) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#F9FAFB]">
        <AuthCard title="Success!" subtitle="Your account has been created.">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-6">Redirecting you to login...</p>
            <LoadingPulse className="w-8 h-8 text-[#1E6F8A] mx-auto" />
          </div>
        </AuthCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#F9FAFB]">
      <AuthCard
        title="Create an Account"
        subtitle="Join the Uzbekistan Digital Tourism Ecosystem"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <Input
            type="text"
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-lg"
          />

          <Input
            type="email"
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-lg"
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-lg"
          />

          <Button type="submit" className="w-full relative mt-2 rounded-lg bg-[#1E6F8A]" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingPulse className="scale-50 h-5 w-5 text-white" />
                Registering...
              </span>
            ) : (
              "Sign Up"
            )}
          </Button>

          <p className="text-center text-sm text-gray-600 mt-2">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#1E6F8A] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </main>
  );
}
