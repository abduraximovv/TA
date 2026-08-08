"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSupabase } from "@repo/database";
import type { Session, User } from "@supabase/supabase-js";

export type UserRole = "tourist" | "provider" | "agency" | "admin";

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  isVerified: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, role?: UserRole) => Promise<void>;
  signInWithOtp: (phone: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getIsVerifiedFromSession = (currSession: Session | null): boolean =>
    Boolean(currSession?.user?.app_metadata?.is_verified);

  const getRoleFromSession = (currSession: Session | null): UserRole | null => {
    if (!currSession?.user) return null;
    const appRole = currSession.user.app_metadata?.role;
    if (appRole === "tourist" || appRole === "provider" || appRole === "agency" || appRole === "admin") {
      return appRole as UserRole;
    }
    const userRole = currSession.user.user_metadata?.role;
    if (userRole === "tourist" || userRole === "provider" || userRole === "agency" || userRole === "admin") {
      return userRole as UserRole;
    }
    return null;
  };

  useEffect(() => {
    const supabase = getSupabase();

    // onAuthStateChange fires an INITIAL_SESSION event immediately on subscribe (supabase-js v2),
    // carrying the same session an explicit getSession() call would -- calling both raced two
    // separate state updates for the same session, each with a fresh object reference, which
    // double-fired every effect keyed on `user` (e.g. MyBookingsList fetching bookings twice).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setRole(getRoleFromSession(currentSession));
      setIsVerified(getIsVerifiedFromSession(currentSession));
      setIsLoading(false);

      if (currentSession) {
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `sb-access-token=${currentSession.access_token}; path=/; max-age=${currentSession.expires_in}; SameSite=Lax${secureFlag}`;
        document.cookie = `sb-refresh-token=${currentSession.refresh_token}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
      } else {
        const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
        document.cookie = `sb-refresh-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax${secureFlag}`;
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
    }
  };

  const signUpWithEmail = async (email: string, password: string, assignedRole: UserRole = "tourist") => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: assignedRole },
      },
    });
    if (error) throw error;
    if (data.session) {
      const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax${secureFlag}`;
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
    }
  };

  const signInWithOtp = async (phone: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        role,
        isVerified,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithOtp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SessionProvider");
  }
  return context;
}
