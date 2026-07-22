import React from "react";
import { Users as UsersIcon } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage tourists, providers, and agencies.</p>
      </div>
      
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <UsersIcon className="w-8 h-8 text-[#1E6F8A]" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">User Management (Stage 2)</h3>
        <p className="text-sm text-gray-500 max-w-md">
          Deep business logic and full user management functionality will be implemented in Stage 2 of the development pipeline.
        </p>
      </div>
    </div>
  );
}
