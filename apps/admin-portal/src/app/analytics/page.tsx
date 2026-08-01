import React from "react";
import { Card } from "@repo/ui";
import { getAnalyticsData } from "../actions/analyticsActions";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-400",
  accepted: "bg-blue-400",
  declined: "bg-red-400",
  completed: "bg-emerald-500",
  cancelled: "bg-gray-300",
};

const ROLE_COLORS: Record<string, string> = {
  tourist: "bg-blue-500",
  provider: "bg-emerald-500",
  agency: "bg-purple-500",
  admin: "bg-gray-500",
};

export default async function Analytics() {
  const data = await getAnalyticsData();
  const maxStatus = Math.max(...data.bookingsByStatus.map((s) => s.count), 1);
  const maxRole = Math.max(...data.usersByRole.map((r) => r.count), 1);
  const maxServiceBookings = Math.max(...data.topServices.map((s) => s.bookings), 1);

  return (
    <div className="p-8 space-y-6" data-testid="analytics-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide booking, user, and review breakdown.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-gray-100 shadow-sm rounded-xl bg-white">
          <h3 className="text-base font-bold text-gray-900 mb-4">Bookings by Status</h3>
          <div className="space-y-3">
            {data.bookingsByStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <div className="w-20 text-xs font-medium text-gray-500 capitalize">{s.status}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-full rounded-full ${STATUS_COLORS[s.status]}`} style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                </div>
                <div className="w-10 text-right text-xs font-semibold text-gray-700">{s.count}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border border-gray-100 shadow-sm rounded-xl bg-white">
          <h3 className="text-base font-bold text-gray-900 mb-4">Users by Role</h3>
          <div className="space-y-3">
            {data.usersByRole.map((r) => (
              <div key={r.role} className="flex items-center gap-3">
                <div className="w-20 text-xs font-medium text-gray-500 capitalize">{r.role}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-full rounded-full ${ROLE_COLORS[r.role]}`} style={{ width: `${(r.count / maxRole) * 100}%` }} />
                </div>
                <div className="w-10 text-right text-xs font-semibold text-gray-700">{r.count}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border border-gray-100 shadow-sm rounded-xl bg-white">
          <h3 className="text-base font-bold text-gray-900 mb-4">Top Services by Bookings</h3>
          {data.topServices.length === 0 ? (
            <p className="text-sm text-gray-400">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topServices.map((s) => (
                <div key={s.title} className="flex items-center gap-3">
                  <div className="w-40 text-xs font-medium text-gray-700 truncate" title={s.title}>{s.title}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full bg-[#1E6F8A]" style={{ width: `${(s.bookings / maxServiceBookings) * 100}%` }} />
                  </div>
                  <div className="w-10 text-right text-xs font-semibold text-gray-700">{s.bookings}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 border border-gray-100 shadow-sm rounded-xl bg-white flex flex-col justify-center items-center text-center">
          <h3 className="text-base font-bold text-gray-900 mb-4 self-start">Review Quality</h3>
          <div className="text-4xl font-bold text-gray-900">{data.avgRating > 0 ? data.avgRating.toFixed(1) : "—"}</div>
          <div className="text-sm text-gray-500 mt-1">average rating across {data.totalReviews.toLocaleString()} review{data.totalReviews === 1 ? "" : "s"}</div>
        </Card>
      </div>
    </div>
  );
}
