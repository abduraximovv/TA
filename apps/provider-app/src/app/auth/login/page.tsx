"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@repo/auth";
import { AuthCard, Button, Input, LoadingPulse } from "@repo/ui";

export default function LoginPage() {
  const { signInWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      // The middleware decides where an authenticated user actually belongs
      // (dashboard vs. /auth/pending) — this just triggers that check.
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Provider Portal" subtitle="Sign in to your provider account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-error bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        <Input type="email" label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        <Input type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingPulse className="scale-50 h-5 w-5 text-white" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          New provider?{" "}
          <Link href="/auth/register" className="font-semibold text-primary hover:underline">
            Apply for verification
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
