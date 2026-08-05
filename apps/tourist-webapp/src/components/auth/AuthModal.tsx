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
        {/* Blurred glass overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-dark-forest/40 backdrop-blur-md z-50 transition-opacity" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-8 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] focus:outline-none overflow-hidden border border-white/20">
          {/* Decorative Gradient Line */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />
          
          <div className="flex justify-between items-start mb-8 mt-2">
            <div>
              <Dialog.Title className="text-3xl font-serif font-bold text-dark-graphite tracking-tight mb-2">
                {mode === "login" ? "Welcome Back" : "Begin Your Journey"}
              </Dialog.Title>
              <Dialog.Description className="text-gray-500 text-sm font-medium">
                {mode === "login" 
                  ? "Sign in to access your saved itineraries."
                  : "Create an account to start your authentic experience."}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 text-gray-400 hover:text-dark-graphite rounded-full hover:bg-gray-50 transition-colors focus:outline-none -mr-2">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-error text-sm rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:border-primary focus:ring-primary rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 h-14 bg-gray-50/50 border-gray-200 focus:border-primary focus:ring-primary rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-base font-bold bg-emerald-950 hover:bg-primary-dark transition-colors rounded-xl shadow-md hover:shadow-lg"
            >
              {isLoading ? "Please wait..." : (mode === "login" ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <div className="mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleSignIn}
              className="w-full h-14 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-dark-graphite font-semibold rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              <Chrome className="w-5 h-5 text-blue-500" /> Google
            </Button>
          </div>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 font-medium">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-emerald-950 font-bold hover:text-primary-dark transition-colors focus:outline-none"
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
