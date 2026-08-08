"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, Card, Input, LoadingPulse } from "@repo/ui";
import { useAuth } from "@repo/auth";
import { registerProvider } from "../../actions/registerProvider";

export default function RegisterProviderPage() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signInWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await registerProvider({ businessName, email, phone, password });
      // Sign the new user in immediately so the middleware guard can pick up their
      // (unverified) session and route them to /auth/pending.
      await signInWithEmail(email, password);
      router.push("/auth/pending");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9F8F5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-primary rounded-b-[40px] z-0" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-lg bg-white w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Provider Application</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Join the Safron ecosystem. Provide your business details for verification.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <Input
              type="text"
              label="Business Name"
              placeholder="e.g. Samarkand Stays"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-lg"
            />

            <Input
              type="email"
              label="Business Email"
              placeholder="contact@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-lg"
            />

            <Input
              type="tel"
              label="Phone Number"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-lg"
            />

            <Input
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              disabled={isLoading}
              className="rounded-lg"
            />

            <Button type="submit" className="w-full relative mt-4 rounded-lg h-12" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingPulse className="scale-50 h-5 w-5 text-white" />
                  Submitting Application...
                </span>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
