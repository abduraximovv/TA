"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, LoadingPulse } from "@repo/ui";
import { getSupabase } from "@repo/database";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterAgencyPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = getSupabase();
      
      // We do not create an auth user yet. We just insert a request.
      const { error: dbError } = await supabase
        .from("agency_requests")
        .insert([{
          company_name: companyName,
          email,
          phone,
        }]);

      if (dbError) {
        // Handle unique constraint error on email
        if (dbError.code === '23505') {
          throw new Error("An agency with this email has already requested access.");
        }
        throw new Error(dbError.message || "Failed to submit request.");
      }

      router.push("/register/success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-[#1E6F8A] rounded-b-[40px] z-0"></div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl bg-white w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Agency Application</h1>
            <p className="text-gray-500 mt-2 text-sm">Join the UzTour ecosystem. Please provide your business details for verification.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <Input
              type="text"
              label="Company Name"
              placeholder="e.g. Silk Road Adventures LLC"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-lg"
            />

            <Input
              type="email"
              label="Business Email"
              placeholder="contact@agency.com"
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

            <Button type="submit" className="w-full relative mt-4 rounded-lg bg-[#1E6F8A] hover:bg-[#155368] h-12" disabled={isLoading}>
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
              <Link href="/login" className="font-semibold text-[#1E6F8A] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
