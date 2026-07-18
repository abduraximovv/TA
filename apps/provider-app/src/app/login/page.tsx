"use client";

import React, { useState } from "react";
import { useAuth } from "@repo/auth";
import { AuthCard, Button, Input, LoadingPulse } from "@repo/ui";

export default function LoginPage() {
  const { signInWithOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!otpSent) {
        await signInWithOtp(phone);
        setOtpSent(true);
      } else {
        // Typically, we would verify OTP here. For MVP, assume it redirects via session.
        // If Supabase handles magic link, we tell them to check SMS.
        setError("Please check your SMS for the login link.");
      }
    } catch (err: unknown) {
      setError("An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Provider Portal" subtitle="Login with your Phone Number">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-error bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        <Input
          type="tel"
          label="Phone Number"
          placeholder="+998 90 123 45 67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={isLoading || otpSent}
        />
        <Button type="submit" className="w-full relative mt-2" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <LoadingPulse className="scale-50 h-5 w-5 text-white" />
              Sending...
            </span>
          ) : otpSent ? (
            "Resend OTP"
          ) : (
            "Send OTP"
          )}
        </Button>
      </form>
    </AuthCard>
  );
}
