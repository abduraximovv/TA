"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getSupabase, Event } from "@repo/database";
import { Toast } from "@repo/ui";
import { useAuth } from "@repo/auth";
import {
  createEvent,
  deleteEvent,
  updateEvent,
  EventFormInput,
} from "../actions/eventActions";

const EMPTY_FORM: EventFormInput = {
  title: "",
  description: "",
  location: "",
  image_url: "",
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  event_type: "Culture",
  is_featured: true,
  ticket_url: "",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormInput>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });
      if (error) throw error;
      setEvents((data ?? []) as Event[]);
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      setToastMessage(err.message || "Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const startCreate = () => {
    setEditingId("new");
    setForm({
      ...EMPTY_FORM,
      start_date: new Date().toISOString().split("T")[0],
    });
  };

  const startEdit = (e: Event) => {
    setEditingId(e.id);
    setForm({
      title: e.title,
      description: e.description ?? "",
      location: e.location ?? "",
      image_url: e.image_url ?? "",
      start_date: e.start_date ? e.start_date.split("T")[0] : "",
      end_date: e.end_date ? e.end_date.split("T")[0] : "",
      event_type: e.event_type ?? "Culture",
      is_featured: e.is_featured ?? true,
      ticket_url: e.ticket_url ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setToastMessage("Title is required.");
      return;
    }
    if (!form.start_date) {
      setToastMessage("Start date is required.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingId === "new") {
        await createEvent(form);
        setToastMessage(`Event "${form.title}" created.`);
      } else if (editingId) {
        await updateEvent(editingId, form);
        setToastMessage(`Event "${form.title}" updated.`);
      }
      cancelEdit();
      await fetchEvents();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : "Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: Event) => {
    if (!confirm(`Delete event "${e.title}"? This cannot be undone.`)) return;
    try {
      await deleteEvent(e.id);
      setToastMessage(`Event "${e.title}" deleted.`);
      await fetchEvents();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : "Failed to delete event.");
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
          <span style={{ color: "#0A2320", fontWeight: 600 }}>Events Management</span>
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
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#0A2320", marginBottom: 4 }}>Events & Festivals</div>
            <div style={{ fontSize: 14, color: "rgba(10,35,32,0.55)" }}>Manage upcoming cultural festivals, exhibitions, and calendar events featured on the homepage.</div>
          </div>
          {editingId === null && (
            <button
              onClick={startCreate}
              style={{ background: "#006B70", color: "white", border: "none", borderRadius: 5, padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
            >
              + New Event
            </button>
          )}
        </div>

        {editingId !== null && (
          <div style={{ background: "#FFFFFF", borderRadius: 8, boxShadow: "0 1px 3px rgba(10,35,32,0.06)", border: "1px solid rgba(10,35,32,0.05)", padding: 24, marginBottom: 24 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#0A2320", marginBottom: 18 }}>
              {editingId === "new" ? "New Event" : "Edit Event"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <label>
                <div style={labelStyle}>Event Title</div>
                <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sharq Taronalari Music Festival" />
              </label>
              <label>
                <div style={labelStyle}>Location / City</div>
                <input style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Samarkand" />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <label>
                <div style={labelStyle}>Event Type / Category</div>
                <input style={inputStyle} value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} placeholder="Culture, Festival, Bazaar..." />
              </label>
              <label>
                <div style={labelStyle}>Start Date</div>
                <input type="date" style={inputStyle} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </label>
              <label>
                <div style={labelStyle}>End Date (Optional)</div>
                <input type="date" style={inputStyle} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </label>
            </div>

            <label style={{ display: "block", marginBottom: 16 }}>
              <div style={labelStyle}>Description</div>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief summary of the event..." />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <label>
                <div style={labelStyle}>Cover Image URL</div>
                <input style={inputStyle} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </label>
              <label>
                <div style={labelStyle}>Ticket / Detail URL</div>
                <input style={inputStyle} value={form.ticket_url} onChange={(e) => setForm({ ...form, ticket_url: e.target.value })} placeholder="/discover or external link" />
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                <div style={labelStyle}>Featured on Homepage ("What's On")</div>
              </label>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{ background: "#006B70", color: "white", border: "none", borderRadius: 5, padding: "10px 20px", fontSize: 13.5, fontWeight: 600, cursor: isSaving ? "default" : "pointer", opacity: isSaving ? 0.6 : 1 }}
              >
                {isSaving ? "Saving…" : "Save Event"}
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
            <div style={{ padding: 40, textAlign: "center", color: "rgba(10,35,32,0.5)", fontSize: 14 }}>Loading events...</div>
          ) : events.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(10,35,32,0.5)", fontSize: 14 }}>No events created yet.</div>
          ) : (
            events.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 26px", borderBottom: "1px solid #F5F3EE" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 6,
                    flexShrink: 0,
                    backgroundImage: e.image_url ? `url(${e.image_url})` : undefined,
                    backgroundColor: "#EFEDE7",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "#0A2320" }}>{e.title}</div>
                  <div style={{ fontSize: 12.5, color: "rgba(10,35,32,0.5)", marginTop: 2 }}>
                    {e.location || "Uzbekistan"} · {e.event_type || "Festival"} · {e.start_date ? e.start_date.split("T")[0] : ""} {e.end_date ? `to ${e.end_date.split("T")[0]}` : ""}
                  </div>
                </div>
                {e.is_featured && (
                  <div style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 100, background: "rgba(197,168,128,0.18)", color: "#8A6D3B", flexShrink: 0 }}>
                    Featured
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(e)}
                    style={{ background: "transparent", border: "1px solid rgba(10,35,32,0.2)", color: "#0A2320", borderRadius: 4, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(e)}
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
