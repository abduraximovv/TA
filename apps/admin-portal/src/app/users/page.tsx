"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Users as UsersIcon, ShieldCheck, ShieldAlert } from "lucide-react";
import { getAllUserProfiles, type UserProfileRow } from "../actions/usersActions";

const ROLE_FILTERS = ["all", "tourist", "provider", "agency", "admin"] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];

const roleBadgeStyle: Record<UserProfileRow["role"], string> = {
  tourist: "bg-blue-50 text-blue-700",
  provider: "bg-emerald-50 text-emerald-700",
  agency: "bg-purple-50 text-purple-700",
  admin: "bg-gray-100 text-gray-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllUserProfiles()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (u.full_name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
    });
  }, [users, roleFilter, search]);

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users Management</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length.toLocaleString()} accounts across tourists, providers, agencies, and admins.</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="bg-white border border-gray-200 text-sm text-gray-700 py-2 px-4 rounded-lg shadow-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#1E6F8A] focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        {ROLE_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              roleFilter === r ? "bg-[#1E6F8A] text-white border-[#1E6F8A]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 text-sm">Loading users…</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <UsersIcon className="w-8 h-8 text-[#1E6F8A]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No users found</h3>
            <p className="text-sm text-gray-500 max-w-md">Try a different search term or role filter.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
              <tr>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Name</th>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Email</th>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Role</th>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Phone</th>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Status</th>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.full_name || "—"}</td>
                  <td className="px-5 py-3 text-gray-600">{u.email || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleBadgeStyle[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{u.phone || "—"}</td>
                  <td className="px-5 py-3">
                    {u.is_verified ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-500 text-xs font-medium">
                        <ShieldAlert className="w-3.5 h-3.5" /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
