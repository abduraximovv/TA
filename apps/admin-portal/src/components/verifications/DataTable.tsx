"use client";

import React from "react";
import { format } from "date-fns";
import { ProviderVerification } from "../../app/verifications/types";

interface DataTableProps {
  data: ProviderVerification[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function DataTable({ data, selectedId, onSelect }: DataTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-sm font-bold tracking-tight text-gray-900">Verification Requests</h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-gray-200 rounded-full shadow-sm text-gray-600">
          {data.length} Total
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white sticky top-0 border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] z-10">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Business Name</th>
              <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Role</th>
              <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Date Applied</th>
              <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                  No pending verifications found.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onSelect(item.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedId === item.id 
                      ? "bg-blue-50/50 hover:bg-blue-50" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{item.business_name || "Unknown Business"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {item.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(item.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      item.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    } capitalize`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        item.status === 'pending' ? 'bg-orange-500' :
                        item.status === 'approved' ? 'bg-emerald-500' :
                        'bg-red-500'
                      }`} />
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
