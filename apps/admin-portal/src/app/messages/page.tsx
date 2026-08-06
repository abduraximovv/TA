"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Inbox, Search, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Toast } from "@repo/ui";
import { getContactMessages, updateMessageStatus, type ContactMessage, type MessageStatus } from "../actions/messagesActions";

const STATUS_FILTERS = ["all", "new", "read", "resolved"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const TYPE_FILTERS = ["all", "contact", "feedback"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

const STATUS_BADGE: Record<MessageStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  read: "bg-gray-100 text-gray-600",
  resolved: "bg-emerald-50 text-emerald-700",
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getContactMessages();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${m.name} ${m.email} ${m.subject || ""} ${m.message}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [messages, statusFilter, typeFilter, search]);

  const newCount = messages.filter((m) => m.status === "new").length;

  const handleStatusChange = async (m: ContactMessage, status: MessageStatus) => {
    setPendingId(m.id);
    try {
      await updateMessageStatus(m.id, status);
      setMessages((prev) => prev.map((row) => (row.id === m.id ? { ...row, status } : row)));
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Failed to update message.");
    } finally {
      setPendingId(null);
    }
  };

  const toggleExpand = (m: ContactMessage) => {
    setExpandedId((prev) => (prev === m.id ? null : m.id));
    if (m.status === "new") handleStatusChange(m, "read");
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            {messages.length.toLocaleString()} total &middot; {newCount.toLocaleString()} new. Submissions from the Contact page and site feedback widget.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, message…"
            className="bg-white border border-gray-200 text-sm text-gray-700 py-2 pl-9 pr-4 rounded-lg shadow-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#006B70] focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === f ? "bg-[#006B70] text-white border-[#006B70]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f === "all" ? "All Status" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              typeFilter === f ? "bg-[#0A2320] text-white border-[#0A2320]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f === "all" ? "All Types" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 text-sm">Loading messages…</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-[#006B70]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No messages found</h3>
            <p className="text-sm text-gray-500 max-w-md">
              {messages.length === 0 ? "Nothing submitted through Contact or Feedback yet." : "Try a different search term or filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((m) => {
              const isExpanded = expandedId === m.id;
              return (
                <div key={m.id}>
                  <button onClick={() => toggleExpand(m)} className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50/60 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[#0A2320] text-[#C5A880] flex items-center justify-center font-serif font-semibold text-sm shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm">{m.name}</span>
                        <span className="text-gray-400 text-xs">{m.email}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${m.type === "feedback" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                          {m.type}
                        </span>
                        {m.rating != null && (
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: m.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-[#C5A880] fill-[#C5A880]" />
                            ))}
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-auto ${STATUS_BADGE[m.status]}`}>{m.status}</span>
                      </div>
                      {m.subject && <div className="text-sm font-medium text-gray-700 mt-1">{m.subject}</div>}
                      <p className={`text-sm text-gray-500 mt-1 ${isExpanded ? "" : "truncate"}`}>{m.message}</p>
                      <div className="text-xs text-gray-400 mt-1.5">
                        {new Date(m.created_at).toLocaleString()} {m.page_source ? `· from ${m.page_source}` : ""}
                      </div>
                    </div>
                    <div className="shrink-0 text-gray-300 mt-1">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 pl-[52px] flex items-center gap-2">
                      {(["new", "read", "resolved"] as MessageStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(m, s)}
                          disabled={pendingId === m.id || m.status === s}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-md border capitalize transition-colors ${
                            m.status === s ? "bg-gray-100 text-gray-400 border-gray-100 cursor-default" : "border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          Mark {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Toast message={toastMessage ?? ""} isVisible={toastMessage !== null} onClose={() => setToastMessage(null)} />
    </div>
  );
}
