"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, Search } from "lucide-react";
import { Toast } from "@repo/ui";
import { getNewsletterSubscribers, setNewsletterSubscriberActive, type NewsletterSubscriber } from "../actions/newsletterActions";

const STATUS_FILTERS = ["all", "active", "paused"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getNewsletterSubscribers();
      setSubscribers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscribers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (statusFilter === "active" && !s.is_active) return false;
      if (statusFilter === "paused" && s.is_active) return false;
      if (search.trim() && !s.email.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [subscribers, statusFilter, search]);

  const activeCount = subscribers.filter((s) => s.is_active).length;

  const handleToggle = async (s: NewsletterSubscriber) => {
    setPendingId(s.id);
    try {
      await setNewsletterSubscriberActive(s.id, !s.is_active);
      setSubscribers((prev) => prev.map((row) => (row.id === s.id ? { ...row, is_active: !row.is_active } : row)));
      setToastMessage(!s.is_active ? `Resumed ${s.email}.` : `Paused ${s.email}.`);
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Failed to update subscriber.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {subscribers.length.toLocaleString()} total &middot; {activeCount.toLocaleString()} active. Collected from the site footer.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email…"
            className="bg-white border border-gray-200 text-sm text-gray-700 py-2 pl-9 pr-4 rounded-lg shadow-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#006B70] focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === f ? "bg-[#006B70] text-white border-[#006B70]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 text-sm">Loading subscribers…</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-[#006B70]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No subscribers found</h3>
            <p className="text-sm text-gray-500 max-w-md">
              {subscribers.length === 0 ? "Nobody has joined the newsletter yet." : "Try a different search term or filter."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
              <tr>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Email</th>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Source</th>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Subscribed</th>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Status</th>
                <th className="text-right font-medium text-gray-500 px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-5 py-3 font-medium text-gray-900">{s.email}</td>
                  <td className="px-5 py-3 text-gray-600 capitalize">{s.source || "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        s.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.is_active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleToggle(s)}
                      disabled={pendingId === s.id}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors ${
                        s.is_active
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      } ${pendingId === s.id ? "opacity-50 cursor-default" : "cursor-pointer"}`}
                    >
                      {pendingId === s.id ? "…" : s.is_active ? "Pause" : "Resume"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Toast message={toastMessage ?? ""} isVisible={toastMessage !== null} onClose={() => setToastMessage(null)} />
    </div>
  );
}
