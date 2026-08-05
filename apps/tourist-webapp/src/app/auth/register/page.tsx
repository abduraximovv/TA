"use client";

import React, { useState } from "react";
import { useAuth } from "@repo/auth";
import { Button, Input, LoadingPulse } from "@repo/ui";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Key, Chrome, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
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
      await signUpWithEmail(email, password, "tourist");
      window.location.href = "/profile";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already registered") || message.includes("User already exists")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (message.includes("Password should be at least")) {
        setError("Password should be at least 6 characters long.");
      } else {
        setError("Failed to create an account. Please try again later.");
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
    <main className="min-h-screen flex bg-white flex-row-reverse">
      {/* Right side - Image (hidden on mobile) */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden bg-dark-forest">
        <Image
          src="https://images.unsplash.com/photo-1565107778791-76e4e3e0f795?w=1200&q=80"
          alt="Bukhara Architecture"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <h2 className="text-white font-serif text-4xl font-bold mb-4 leading-tight">
            Begin your Silk Road journey today.
          </h2>
          <p className="text-white/80 text-lg">
            Create an account to unlock personalized itineraries and local experiences.
          </p>
        </div>
      </div>

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 xl:p-24 relative">
        <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-dark-graphite mb-3 tracking-tight">
              Create Account
            </h1>
            <p className="text-gray-500 font-medium">
              Sign up to discover the authentic Uzbekistan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-4 text-sm font-medium text-error bg-red-50 border border-red-100 rounded-xl">
                {error}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:border-primary focus:ring-primary rounded-xl"
              />
            </div>

            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Input
                type="password"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:border-primary focus:ring-primary rounded-xl"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 mt-2 rounded-xl bg-emerald-950 hover:bg-primary-dark font-bold shadow-md hover:shadow-lg transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingPulse className="scale-50 h-5 w-5 text-white" />
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-bold">
              <span className="bg-white px-4 text-gray-400">Or sign up with</span>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full h-14 border-2 border-gray-100 text-dark-graphite hover:border-gray-200 hover:bg-gray-50 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            Google
          </Button>

          <p className="mt-10 text-center text-sm text-gray-500 font-medium">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-emerald-950 font-bold hover:text-primary-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
