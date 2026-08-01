import React from "react";

// Root-level fallback loading state -- applies to any page without its own more specific
// loading.tsx (e.g. "/"). Routes with list/detail data fetches use PageLoadingSkeleton instead.
export default function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F9F8F5",
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "3px solid rgba(10,35,32,0.1)",
          borderTopColor: "#C5A880",
        }}
      />
    </main>
  );
}
