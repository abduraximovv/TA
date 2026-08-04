"use client";

import React from "react";
import { format } from "date-fns";
import type { EnrichedBooking } from "./types";

interface BookingsDataTableProps {
  data: EnrichedBooking[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const statusStyles: Record<string, string> = {
  pending: "bg-orange-50 text-orange-700 border-orange-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-accent/10 text-accent border-accent/20",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
};

const statusDot: Record<string, string> = {
  pending: "bg-orange-500",
  accepted: "bg-emerald-500",
  declined: "bg-red-500",
  completed: "bg-accent",
  cancelled: "bg-gray-400",
};

export function BookingsDataTable({ data, selectedId, onSelect }: BookingsDataTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full min-w-0">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-sm font-bold tracking-tight text-gray-900">Booking Requests</h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-gray-200 rounded-full shadow-sm text-gray-600">
          {data.length} Total
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white sticky top-0 border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] z-10">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Booked</th>
              <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Tourist</th>
              <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Date</th>
              <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                  No bookings yet.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedId === item.id ? "bg-accent/5 hover:bg-accent/10" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-[240px] truncate" title={item.itemTitle}>
                    {item.itemTitle}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.touristName}</td>
                  <td className="px-6 py-4 text-gray-500">{format(new Date(item.booking_date), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                        statusStyles[item.status] ?? statusStyles.pending
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusDot[item.status] ?? statusDot.pending}`} />
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
