"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@repo/auth";
import { AuthCard, Button, Input, LoadingPulse } from "@repo/ui";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set by middleware when a valid session's role isn't admin -- e.g. a tourist/provider/agency
  // account signing in here with their own correct password. Sign them back out so the mismatched
  // session doesn't linger and this form is left in a clean, retryable state.
  useEffect(() => {
    if (searchParams.get("error") === "wrong_portal") {
      setError("This account isn't registered for the Admin Portal.");
      signOut().catch(() => {});
    }
  }, [searchParams, signOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError("Invalid admin credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Admin Portal" subtitle="Secure Admin Access">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-error bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        <Input type="email" label="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        <Input type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthCard>
  );
}
