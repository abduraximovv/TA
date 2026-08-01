import React from "react";

// Shared shimmer loading state for server-fetched pages. Next.js renders this automatically
// (via loading.tsx files) while the page's async data fetch is in flight, instead of a blank
// white screen.
export function PageLoadingSkeleton({ variant = "grid" }: { variant?: "grid" | "detail" }) {
  return (
    <main style={{ minHeight: "100vh", paddingTop: 112, paddingBottom: 96, background: "#F9F8F5" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px" }}>
        <div className="animate-pulse" style={{ marginBottom: 48 }}>
          <div style={{ height: 12, width: 160, background: "#EBEDED", borderRadius: 4, marginBottom: 16 }} />
          <div style={{ height: 44, width: "60%", maxWidth: 480, background: "#EBEDED", borderRadius: 6, marginBottom: 12 }} />
          <div style={{ height: 16, width: "40%", maxWidth: 360, background: "#EBEDED", borderRadius: 4 }} />
        </div>

        {variant === "grid" ? (
          <div
            className="animate-pulse"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 380, background: "#EBEDED", borderRadius: 8 }} />
            ))}
          </div>
        ) : (
          <div className="animate-pulse" style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ height: 280, background: "#EBEDED", borderRadius: 8, marginBottom: 24 }} />
            <div style={{ height: 16, width: "90%", background: "#EBEDED", borderRadius: 4, marginBottom: 10 }} />
            <div style={{ height: 16, width: "75%", background: "#EBEDED", borderRadius: 4 }} />
          </div>
        )}
      </div>
    </main>
  );
}
