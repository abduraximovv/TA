"use client";

import React, { useState } from "react";
import { useAuth } from "@repo/auth";
import { AuthCard, Button, Input, LoadingPulse } from "@repo/ui";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      // Let the middleware handle the role-based redirection from here on out
      window.location.href = "/profile";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Invalid login credentials") || message.includes("invalid_credentials")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An authentication error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError("Failed to initialize Google login. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#F9FAFB]">
      <AuthCard
        title="Sign In"
        subtitle="Uzbekistan Digital Tourism Ecosystem"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

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
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </Button>
      </AuthCard>
    </main>
  );
}
