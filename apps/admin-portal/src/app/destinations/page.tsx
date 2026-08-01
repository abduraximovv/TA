"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@repo/database";
import { Toast } from "@repo/ui";
import { useAuth } from "@repo/auth";
import { Destination } from "./types";
import {
  createDestination,
  deleteDestination,
  updateDestination,
  DestinationFormInput,
} from "../actions/destinationActions";

const EMPTY_FORM: DestinationFormInput = {
  name: "",
  region: "",
  description: "",
  body: "",
  image_url: "",
  hero_image_url: "",
  gallery_images: [],
  is_featured: false,
  display_order: 0,
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DestinationFormInput>(EMPTY_FORM);
  const [galleryText, setGalleryText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const fetchDestinations = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      setDestinations((data ?? []) as Destination[]);
    } catch (err: any) {
      console.error("Failed to fetch destinations:", err);
      setToastMessage(err.message || "Failed to load destinations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const startCreate = () => {
    setEditingId("new");
    setForm(EMPTY_FORM);
    setGalleryText("");
  };

  const startEdit = (d: Destination) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      region: d.region ?? "",
      description: d.description ?? "",
      body: d.body ?? "",
      image_url: d.image_url ?? "",
      hero_image_url: d.hero_image_url ?? "",
      gallery_images: d.gallery_images ?? [],
      is_featured: d.is_featured,
      display_order: d.display_order,
    });
    setGalleryText((d.gallery_images ?? []).join("\n"));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setGalleryText("");
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToastMessage("Name is required.");
      return;
    }
    setIsSaving(true);
    try {
      const payload: DestinationFormInput = {
        ...form,
        gallery_images: galleryText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editingId === "new") {
        await createDestination(payload);
        setToastMessage(`${payload.name} created.`);
      } else if (editingId) {
        await updateDestination(editingId, payload);
        setToastMessage(`${payload.name} updated.`);
      }
      cancelEdit();
      await fetchDestinations();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : "Failed to save destination.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (d: Destination) => {
    if (!confirm(`Delete "${d.name}"? This cannot be undone.`)) return;
    try {
      await deleteDestination(d.id);
      setToastMessage(`${d.name} deleted.`);
      await fetchDestinations();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : "Failed to delete destination.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 5,
    border: "1px solid rgba(10,35,32,0.15)",
    fontSize: 13.5,
    fontFamily: "'Inter', sans-serif",
    color: "#0A2320",
    marginTop: 4,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(10,35,32,0.6)",
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F9F8F5", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ height: 76, flexShrink: 0, background: "#FFFFFF", borderBottom: "1px solid #E5E3DD", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(10,35,32,0.55)" }}>
          <span>Admin Portal</span>
          <span style={{ color: "rgba(10,35,32,0.3)" }}>/</span>
          <span style={{ color: "#0A2320", fontWeight: 600 }}>Destinations</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "50%", background: "#0A2320", color: "#C5A880", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600 }}>
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 32, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#0A2320", marginBottom: 4 }}>Destinations</div>
            <div style={{ fontSize: 14, color: "rgba(10,35,32,0.55)" }}>Curate the blog-style destination guides shown to tourists.</div>
          </div>
          {editingId === null && (
            <button
              onClick={startCreate}
              style={{ background: "#006B70", color: "white", border: "none", borderRadius: 5, padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
            >
              + New Destination
            </button>
          )}
        </div>

        {editingId !== null && (
          <div style={{ background: "#FFFFFF", borderRadius: 8, boxShadow: "0 1px 3px rgba(10,35,32,0.06)", border: "1px solid rgba(10,35,32,0.05)", padding: 24, marginBottom: 24 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#0A2320", marginBottom: 18 }}>
              {editingId === "new" ? "New Destination" : "Edit Destination"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <label>
                <div style={labelStyle}>Name</div>
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Samarkand" />
              </label>
              <label>
                <div style={labelStyle}>Region</div>
                <input style={inputStyle} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Samarkand Region" />
              </label>
            </div>

            <label style={{ display: "block", marginBottom: 16 }}>
              <div style={labelStyle}>Short description (card summary)</div>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>

            <label style={{ display: "block", marginBottom: 16 }}>
              <div style={labelStyle}>Full write-up (blog body)</div>
              <textarea style={{ ...inputStyle, minHeight: 140, resize: "vertical" }} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <label>
                <div style={labelStyle}>Cover image URL</div>
                <input style={inputStyle} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" />
              </label>
              <label>
                <div style={labelStyle}>Hero image URL</div>
                <input style={inputStyle} value={form.hero_image_url} onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })} placeholder="https://…" />
              </label>
            </div>

            <label style={{ display: "block", marginBottom: 16 }}>
              <div style={labelStyle}>Gallery images (one URL per line)</div>
              <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5 }} value={galleryText} onChange={(e) => setGalleryText(e.target.value)} placeholder={"https://…\nhttps://…"} />
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                <div style={labelStyle}>Featured on home page</div>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={labelStyle}>Display order</div>
                <input type="number" style={{ ...inputStyle, width: 80, marginTop: 0 }} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{ background: "#006B70", color: "white", border: "none", borderRadius: 5, padding: "10px 20px", fontSize: 13.5, fontWeight: 600, cursor: isSaving ? "default" : "pointer", opacity: isSaving ? 0.6 : 1 }}
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={cancelEdit}
                style={{ background: "transparent", border: "1px solid rgba(10,35,32,0.2)", color: "#0A2320", borderRadius: 5, padding: "10px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ background: "#FFFFFF", borderRadius: 8, boxShadow: "0 1px 3px rgba(10,35,32,0.06)", border: "1px solid rgba(10,35,32,0.05)", overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(10,35,32,0.5)", fontSize: 14 }}>Loading destinations...</div>
          ) : destinations.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(10,35,32,0.5)", fontSize: 14 }}>No destinations yet.</div>
          ) : (
            destinations.map((d) => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 26px", borderBottom: "1px solid #F5F3EE" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 6,
                    flexShrink: 0,
                    backgroundImage: d.image_url ? `url(${d.image_url})` : undefined,
                    backgroundColor: "#EFEDE7",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "#0A2320" }}>{d.name}</div>
                  <div style={{ fontSize: 12.5, color: "rgba(10,35,32,0.5)", marginTop: 2 }}>{d.region || "No region"} · /{d.slug}</div>
                </div>
                {d.is_featured && (
                  <div style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 100, background: "rgba(197,168,128,0.18)", color: "#8A6D3B", flexShrink: 0 }}>
                    Featured
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(d)}
                    style={{ background: "transparent", border: "1px solid rgba(10,35,32,0.2)", color: "#0A2320", borderRadius: 4, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(d)}
                    style={{ background: "transparent", border: "1px solid rgba(220,38,38,0.5)", color: "#B91C1C", borderRadius: 4, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
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
