"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Mail, Key, Chrome } from "lucide-react";
import { useAuth } from "@repo/auth";
import { Button, Input } from "@repo/ui";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "register";
}

export function AuthModal({ isOpen, onOpenChange, defaultMode = "login" }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, "tourist");
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-6 bg-white rounded-2xl shadow-2xl focus:outline-none overflow-hidden">
          {/* Decorative Pattern Header */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1E6F8A] to-[#D4A843]" />
          
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-bold text-gray-900 tracking-tight">
              {mode === "login" ? "Welcome Back" : "Join the Journey"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-gray-500 mb-6 text-sm">
            {mode === "login" 
              ? "Sign in to access your saved itineraries and bookings."
              : "Create an account to start your authentic Uzbekistan experience."}
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-[#1E6F8A] focus:ring-[#1E6F8A]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-[#1E6F8A] focus:ring-[#1E6F8A]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-medium bg-[#1E6F8A] hover:bg-[#155368] transition-colors rounded-xl"
            >
              {isLoading ? "Please wait..." : (mode === "login" ? "Sign In" : "Register")}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleSignIn}
              className="w-full h-12 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-3"
            >
              <Chrome className="w-5 h-5" /> Google
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-[#1E6F8A] font-semibold hover:underline focus:outline-none"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
