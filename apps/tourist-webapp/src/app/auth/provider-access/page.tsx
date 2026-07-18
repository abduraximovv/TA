"use client";

import React, { useState } from "react";
import { AuthCard, Button, Input, LoadingPulse } from "@repo/ui";
import { useRouter } from "next/navigation";

export default function ProviderAccessPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate sending OTP (Stage 1 mock)
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1000);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate verifying OTP and redirecting to provider dashboard
    setTimeout(() => {
      setIsLoading(false);
      // Since it's a simulated success, we just redirect.
      // In reality, the middleware would catch the token and redirect to localhost:3001.
      window.location.href = "http://localhost:3001/dashboard";
    }, 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#F9FAFB]">
      <AuthCard
        title="Provider Access"
        subtitle="Secure login for verified rural service providers"
      >
        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 mb-2">
              Enter your registered phone number to receive a one-time passcode.
            </p>
            <Input
              type="tel"
              label="Phone Number"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-lg text-lg tracking-wider"
            />
            <Button type="submit" className="w-full relative mt-2 rounded-lg bg-[#D4A843] hover:bg-[#c29631]" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingPulse className="scale-50 h-5 w-5 text-white" />
                  Sending Code...
                </span>
              ) : (
                "Send Passcode"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 mb-2">
              We sent a 6-digit code to <span className="font-semibold">{phone}</span>
            </p>
            <Input
              type="text"
              label="6-Digit Passcode"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              disabled={isLoading}
              className="rounded-lg text-center text-2xl tracking-[0.5em] font-mono"
            />
            <Button type="submit" className="w-full relative mt-2 rounded-lg bg-[#D4A843] hover:bg-[#c29631]" disabled={isLoading || otp.length !== 6}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingPulse className="scale-50 h-5 w-5 text-white" />
                  Verifying...
                </span>
              ) : (
                "Verify & Access Dashboard"
              )}
            </Button>
            <button 
              type="button" 
              onClick={() => setStep("phone")}
              className="text-sm text-gray-500 mt-4 hover:underline"
            >
              Change phone number
            </button>
          </form>
        )}
      </AuthCard>
    </main>
  );
}
