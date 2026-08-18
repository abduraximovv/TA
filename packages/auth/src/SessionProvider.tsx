"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@repo/database";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

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

// Provider App, Agency Portal, and Admin Portal's Edge middleware all read this cookie by name
// (see each app's middleware.ts) to decode role/verification claims without a network round trip
// -- see ADR 008. It used to be the single literal "sb-access-token" for all three apps, which,
// combined with cookies not being scoped by port, meant signing into ANY of the three (including
// admin-portal) wrote a cookie that ALL of them -- and, via a separate but equally unscoped
// @supabase/ssr cookie, tourist-webapp too -- would treat as their own valid session. Each app now
// sets NEXT_PUBLIC_APP_ROLE in its own .env so this cookie name is namespaced per app.
function accessTokenCookieName(): string {
  const role = process.env.NEXT_PUBLIC_APP_ROLE;
  if (!role) {
    console.warn(
      "NEXT_PUBLIC_APP_ROLE is not set -- falling back to the legacy shared \"sb-access-token\" " +
      "cookie name, which is READABLE BY EVERY APP on this host. Set NEXT_PUBLIC_APP_ROLE in this app's .env."
    );
    return "sb-access-token";
  }
  return `sb-${role}-access-token`;
}

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
    const supabase = getSupabaseBrowserClient();

    // onAuthStateChange fires an INITIAL_SESSION event immediately on subscribe (supabase-js v2),
    // carrying the same session an explicit getSession() call would -- calling both raced two
    // separate state updates for the same session, each with a fresh object reference, which
    // double-fired every effect keyed on `user` (e.g. MyBookingsList fetching bookings twice).
    // createBrowserClient (unlike the old plain supabase-js client this used to call) persists
    // the session into cookies itself, in the exact format @supabase/ssr's server-side client
    // expects -- tourist-webapp's own API routes/middleware now read that directly and no
    // longer need anything mirrored by hand.
    //
    // provider-app/agency-portal/admin-portal's Edge middleware are a different consumer,
    // though: they intentionally avoid @supabase/ssr's cookie format and a per-request
    // getUser() network call (see packages/auth/src/verificationGuard.ts's comment), decoding
    // a plain JWT out of a plain, app-scoped access-token cookie instead (see
    // accessTokenCookieName above). That cookie has no other purpose now -- keep writing *only*
    // it (not a refresh-token cookie, which nothing ever read).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setRole(getRoleFromSession(currentSession));
      setIsVerified(getIsVerifiedFromSession(currentSession));
      setIsLoading(false);

      const cookieName = accessTokenCookieName();
      const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
      if (currentSession) {
        document.cookie = `${cookieName}=${currentSession.access_token}; path=/; max-age=${currentSession.expires_in}; SameSite=Lax${secureFlag}`;
      } else {
        document.cookie = `${cookieName}=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, assignedRole: UserRole = "tourist") => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: assignedRole },
      },
    });
    if (error) throw error;
  };

  const signInWithOtp = async (phone: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
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
