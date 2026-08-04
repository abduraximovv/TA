"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, Building2, Search } from "lucide-react";
import { getAgencies, toggleAgencyVerification, type AgencyRow } from "../actions/agencyActions";
import { Toast } from "@repo/ui";
import { useAuth } from "@repo/auth";

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");
  const { user } = useAuth();

  const loadAgencies = async () => {
    try {
      setIsLoading(true);
      const data = await getAgencies();
      setAgencies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agencies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const handleToggle = async (a: AgencyRow) => {
    try {
      const nextState = !a.is_verified;
      await toggleAgencyVerification(a.id, nextState);
      setToastMessage(`Agency "${a.business_name}" is now ${nextState ? "Verified" : "Unverified"}.`);
      await loadAgencies();
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Failed to update verification status.");
    }
  };

  const filtered = useMemo(() => {
    return agencies.filter((a) => {
      if (filter === "verified" && !a.is_verified) return false;
      if (filter === "unverified" && a.is_verified) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (a.business_name ?? "").toLowerCase().includes(q) ||
        (a.full_name ?? "").toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [agencies, filter, search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F9F8F5", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ height: 76, flexShrink: 0, background: "#FFFFFF", borderBottom: "1px solid #E5E3DD", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(10,35,32,0.55)" }}>
          <span>Admin Portal</span>
          <span style={{ color: "rgba(10,35,32,0.3)" }}>/</span>
          <span style={{ color: "#0A2320", fontWeight: 600 }}>Tour Agencies</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%", background: "#0A2320", color: "#C5A880", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600 }}>
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 32, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#0A2320", marginBottom: 4 }}>Travel Agencies</div>
            <div style={{ fontSize: 14, color: "rgba(10,35,32,0.55)" }}>Oversight and verification of registered travel agencies and multi-day tour operators.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agency name, email..."
                style={{
                  padding: "9px 12px 9px 36px",
                  borderRadius: 6,
                  border: "1px solid rgba(10,35,32,0.15)",
                  fontSize: 13.5,
                  width: 260,
                  outline: "none",
                }}
              />
              <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "rgba(10,35,32,0.4)" }} />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["all", "verified", "unverified"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 100,
                border: filter === f ? "1px solid #006B70" : "1px solid rgba(10,35,32,0.15)",
                background: filter === f ? "#006B70" : "#FFFFFF",
                color: filter === f ? "#FFFFFF" : "#0A2320",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Agencies Table */}
        <div style={{ background: "#FFFFFF", borderRadius: 8, boxShadow: "0 1px 3px rgba(10,35,32,0.06)", border: "1px solid rgba(10,35,32,0.05)", overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(10,35,32,0.5)", fontSize: 14 }}>Loading travel agencies...</div>
          ) : error ? (
            <div style={{ padding: 40, textAlign: "center", color: "#B91C1C", fontSize: 14 }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(10,35,32,0.5)", fontSize: 14 }}>No agencies found matching your search.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#FAFAF7", borderBottom: "1px solid #E5E3DD", color: "rgba(10,35,32,0.6)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "14px 20px" }}>Agency / Contact</th>
                  <th style={{ padding: "14px 20px" }}>Email</th>
                  <th style={{ padding: "14px 20px" }}>Phone</th>
                  <th style={{ padding: "14px 20px" }}>Tour Packages</th>
                  <th style={{ padding: "14px 20px" }}>Verification Status</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #F5F3EE" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(197,168,128,0.15)", color: "#8A6D3B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#0A2320", fontSize: 14 }}>{a.business_name || a.full_name || "Agency"}</div>
                          {a.full_name && a.full_name !== a.business_name && (
                            <div style={{ fontSize: 12, color: "rgba(10,35,32,0.5)", marginTop: 2 }}>{a.full_name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", color: "rgba(10,35,32,0.7)" }}>{a.email || "—"}</td>
                    <td style={{ padding: "16px 20px", color: "rgba(10,35,32,0.7)" }}>{a.phone || "—"}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, background: "rgba(10,35,32,0.06)", padding: "4px 10px", borderRadius: 100, color: "#0A2320" }}>
                        {a.packages_count} tour package{a.packages_count === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {a.is_verified ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 100, background: "rgba(74,222,128,0.18)", color: "#15803D" }}>
                          <ShieldCheck size={14} /> Verified
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 100, background: "rgba(220,38,38,0.12)", color: "#B91C1C" }}>
                          <ShieldAlert size={14} /> Unverified
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <button
                        onClick={() => handleToggle(a)}
                        style={{
                          background: a.is_verified ? "transparent" : "#006B70",
                          border: a.is_verified ? "1px solid rgba(220,38,38,0.5)" : "none",
                          color: a.is_verified ? "#B91C1C" : "#FFFFFF",
                          borderRadius: 4,
                          padding: "6px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {a.is_verified ? "Revoke Verification" : "Approve & Verify"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
