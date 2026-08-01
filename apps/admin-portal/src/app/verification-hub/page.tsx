"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@repo/database";
import { Toast } from "@repo/ui";
import { ProviderVerification } from "./types";
import { approveUser, rejectUser } from "../actions/verificationActions";
import { getPlatformStats, type PlatformStats } from "../actions/dashboardActions";
import { useAuth } from "@repo/auth";

export default function VerificationHubPage() {
  const [verifications, setVerifications] = useState<ProviderVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    getPlatformStats().then(setPlatformStats).catch((err) => console.error("Failed to fetch platform stats:", err));
  }, []);

  const fetchVerifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("provider_verifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVerifications((data ?? []) as ProviderVerification[]);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch verifications:", err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerifications();

    const supabase = getSupabase();
    const channel = supabase
      .channel("verification-hub")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "provider_verifications" },
        () => fetchVerifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVerifications]);

  const handleApprove = async (id: string, userId: string, businessName: string) => {
    try {
      await approveUser(id, userId);
      setToastMessage(`${businessName} approved — access granted.`);
      await fetchVerifications();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : "Failed to approve request.");
    }
  };

  const handleReject = async (id: string, businessName: string) => {
    try {
      await rejectUser(id, "Rejected by admin");
      setToastMessage(`${businessName} rejected.`);
      await fetchVerifications();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : "Failed to reject request.");
    }
  };

  const iconWrap = (bg: string) => ({
    width: 34, height: 34, borderRadius: 7, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
  });

  const formatCompact = (n: number): string => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toString();
  };

  const kpiCards = [
    { label: 'Pending Verifications', value: verifications.filter(v => v.status === 'pending').length.toString(), delta: 'Action required', deltaColor: '#B45309', iconWrapStyle: iconWrap('rgba(197,168,128,0.16)'), iconShapeStyle: { width: 14, height: 14, borderRadius: 3, border: '2px solid #C5A880' } },
    { label: 'Active Tourists', value: platformStats ? platformStats.totalTourists.toLocaleString() : '—', delta: platformStats ? `+${platformStats.newTouristsThisWeek} this week` : '', deltaColor: '#006B70', iconWrapStyle: iconWrap('rgba(0,107,112,0.12)'), iconShapeStyle: { width: 14, height: 14, borderRadius: '50%', border: '2px solid #006B70' } },
    { label: 'Total GMV', value: platformStats ? formatCompact(platformStats.totalGmv) : '—', delta: 'completed bookings, last 7 days', deltaColor: '#006B70', iconWrapStyle: iconWrap('rgba(10,35,32,0.08)'), iconShapeStyle: { width: 14, height: 14, borderRadius: 2, background: '#0A2320' } },
    { label: 'Verified Providers', value: platformStats ? platformStats.verifiedProviders.toLocaleString() : '—', delta: platformStats ? `+${platformStats.newVerifiedProvidersThisWeek} this week` : '', deltaColor: '#006B70', iconWrapStyle: iconWrap('rgba(197,168,128,0.16)'), iconShapeStyle: { width: 14, height: 8, borderRadius: 2, borderBottom: '2px solid #C5A880', borderLeft: '2px solid #C5A880', transform: 'rotate(-45deg)', borderTop: 'none', borderRight: 'none' } },
  ];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { bg: 'rgba(74,222,128,0.18)', color: '#15803D', label: 'Verified' };
      case 'rejected':
        return { bg: 'rgba(220,38,38,0.12)', color: '#B91C1C', label: 'Rejected' };
      default:
        return { bg: 'rgba(197,168,128,0.18)', color: '#8A6D3B', label: 'Pending' };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F9F8F5", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ height: 76, flexShrink: 0, background: "#FFFFFF", borderBottom: "1px solid #E5E3DD", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(10,35,32,0.55)" }}>
          <span>Admin Portal</span>
          <span style={{ color: "rgba(10,35,32,0.3)" }}>/</span>
          <span style={{ color: "#0A2320", fontWeight: 600 }}>Verification Hub</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(10,35,32,0.045)", backdropFilter: "blur(8px)", border: "1px solid rgba(10,35,32,0.07)", borderRadius: 100, padding: "9px 16px", width: 260 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1.6px solid rgba(10,35,32,0.4)", flexShrink: 0 }}></div>
            <div style={{ fontSize: 13.5, color: "rgba(10,35,32,0.4)" }}>Search providers, regions…</div>
          </div>
          <div style={{ width: 1, height: 28, background: "#E5E3DD" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%", background: "#0A2320", color: "#C5A880", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600 }}>
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0A2320" }}>{user?.email || "Admin User"}</div>
              <div style={{ fontSize: 11.5, color: "rgba(10,35,32,0.5)" }}>Ministry Oversight</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 32, overflow: "auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#0A2320", marginBottom: 4 }}>Verification Hub</div>
          <div style={{ fontSize: 14, color: "rgba(10,35,32,0.55)" }}>National oversight of provider onboarding and platform activity.</div>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
          {kpiCards.map((k, i) => (
            <div key={i} style={{ background: "#FFFFFF", borderRadius: 8, padding: 22, boxShadow: "0 1px 3px rgba(10,35,32,0.06)", border: "1px solid rgba(10,35,32,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "rgba(10,35,32,0.55)" }}>{k.label}</div>
                <div style={k.iconWrapStyle}><div style={k.iconShapeStyle}></div></div>
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#0A2320" }}>{k.value}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: k.deltaColor, marginTop: 8 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Split layout */}
        <div style={{ display: "grid", gridTemplateColumns: "60% 1fr", gap: 20, alignItems: "start" }}>

          {/* Verification Queue */}
          <div style={{ background: "#FFFFFF", borderRadius: 8, boxShadow: "0 1px 3px rgba(10,35,32,0.06)", border: "1px solid rgba(10,35,32,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "22px 26px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F0EEE8" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#0A2320" }}>Verification Queue</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#006B70" }}>{verifications.filter(v => v.status === 'pending').length} pending</div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              {isLoading ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(10,35,32,0.5)", fontSize: 14 }}>Loading verifications...</div>
              ) : verifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(10,35,32,0.5)", fontSize: 14 }}>No verification requests found.</div>
              ) : (
                verifications.map((q, i) => {
                  const badge = getStatusBadge(q.status);
                  const colors = ['#0A2320', '#006B70', '#C5A880'];
                  const avatarBg = colors[i % colors.length];
                  const initials = q.business_name ? q.business_name.substring(0, 2).toUpperCase() : '??';

                  return (
                    <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 26px", borderBottom: "1px solid #F5F3EE" }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: avatarBg, color: "#F9F8F5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: "#0A2320" }}>{q.business_name}</div>
                        <div style={{ fontSize: 12.5, color: "rgba(10,35,32,0.5)", marginTop: 2 }}>{q.email} {q.phone ? `· ${q.phone}` : ''} · {q.role}</div>
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(10,35,32,0.45)", flexShrink: 0 }}>
                        {getTimeAgo(q.created_at)}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 100, background: badge.bg, color: badge.color, flexShrink: 0 }}>
                        {badge.label}
                      </div>
                      
                      {/* Action buttons if pending */}
                      {q.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
                           <button 
                             onClick={() => handleApprove(q.id, q.user_id, q.business_name)}
                             style={{ background: '#006B70', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                           >
                             Approve
                           </button>
                           <button 
                             onClick={() => handleReject(q.id, q.business_name)}
                             style={{ background: 'transparent', border: '1px solid rgba(220,38,38,0.5)', color: '#B91C1C', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                           >
                             Reject
                           </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Live Heatmap */}
          <div style={{ background: "#0A2320", borderRadius: 8, padding: 24, position: "relative", overflow: "hidden", minHeight: 420, display: "flex", flexDirection: "column" }}>
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(115deg, rgba(0,107,112,0.16) 0px, rgba(0,107,112,0.16) 2px, transparent 2px, transparent 26px), repeating-linear-gradient(25deg, rgba(197,168,128,0.08) 0px, rgba(197,168,128,0.08) 2px, transparent 2px, transparent 34px)" }}></div>
            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#FFFFFF" }}>Tourist Density</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "rgba(249,248,245,0.55)", marginTop: 3 }}>PostGIS heatmap · national grid</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 100, padding: "6px 12px" }}>
                <div style={{ width: 6, height: 6, borderRadius: 100, background: "#C5A880" }}></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#F9F8F5" }}>PREVIEW</div>
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 1, flex: 1, borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(249,248,245,0.4)", letterSpacing: "0.03em" }}>[ Interactive density map renders here ]</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(249,248,245,0.3)", marginTop: 6 }}>Samarkand · Bukhara · Tashkent hotspots</div>
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 20, marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "#006B70" }}></div>
                <div style={{ fontSize: 12, color: "rgba(249,248,245,0.65)" }}>Moderate</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "#C5A880" }}></div>
                <div style={{ fontSize: 12, color: "rgba(249,248,245,0.65)" }}>High</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Toast
        message={toastMessage ?? ""}
        isVisible={toastMessage !== null}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
