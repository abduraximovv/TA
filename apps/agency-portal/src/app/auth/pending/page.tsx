"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@repo/auth";
import { getSupabase } from "@repo/database";
import { LoadingPulse } from "@repo/ui";
import { Clock, FileCheck2, ShieldCheck } from "lucide-react";

const STEPS = [
  { label: "Submitted", icon: FileCheck2, done: true },
  { label: "In review", icon: Clock, done: false, active: true },
  { label: "Approved", icon: ShieldCheck, done: false },
];

export default function PendingPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  };

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();

    const channel = supabase
      .channel(`agency-verification-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "provider_verifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if ((payload.new as { status?: string }).status === "approved") {
            await supabase.auth.refreshSession();
            router.replace("/dashboard");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, router]);

  return (
    <main
      className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-[#1E6F8A] via-[#175A70] to-[#0F3D4C]"
      data-testid="pending-page"
    >
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D4A843]/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-lg p-10 border border-white/15 shadow-2xl rounded-lg bg-white/[0.07] backdrop-blur-xl text-center">
        <div className="relative mx-auto mb-6 flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-[#D4A843]/20 animate-pulse" />
          <LoadingPulse className="scale-150 text-[#D4A843]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4A843]/15 text-[#F0CA6F] border border-[#D4A843]/30 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F0CA6F] animate-pulse" />
          Application in review
        </span>

        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">You're almost there</h1>

        <p className="text-white/80 text-base mb-8 leading-relaxed">
          Thanks for applying to join the Safron ecosystem{user?.email ? ` as ${user.email}` : ""}.
          Our team typically reviews new agencies within 24 hours — this page will jump straight
          to your dashboard the moment you're approved, no need to refresh.
        </p>

        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                      step.done
                        ? "bg-[#D4A843] border-[#D4A843] text-[#0F3D4C]"
                        : step.active
                        ? "bg-white/10 border-[#D4A843] text-[#D4A843]"
                        : "bg-white/5 border-white/20 text-white/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] font-semibold ${step.active ? "text-white" : "text-white/50"}`}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-5 ${step.done ? "bg-[#D4A843]/60" : "bg-white/15"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <button
          onClick={handleSignOut}
          className="text-sm text-white/50 hover:text-white/80 underline underline-offset-2 transition-colors"
        >
          Not you? Sign out
        </button>
      </div>
    </main>
  );
}
