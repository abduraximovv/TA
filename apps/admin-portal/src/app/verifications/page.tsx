"use client";

import React, { useEffect, useState } from "react";
import { getSupabase } from "@repo/database";
import { DataTable } from "../../components/verifications/DataTable";
import { DetailsPanel } from "../../components/verifications/DetailsPanel";
import { ProviderVerification } from "./types";

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<ProviderVerification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabase();
      
      const { data, error } = await supabase
        .from('provider_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications(data as ProviderVerification[]);
    } catch (err: any) {
      console.error("Failed to fetch verifications:", err);
      // For Stage 1: If table doesn't exist, we provide some mock data for UI visualization
      if (err.code === '42P01') {
        console.warn("provider_verifications table not found, using mock data for Stage 1 UI demo.");
        setVerifications([
          {
            id: "req-1",
            user_id: "usr-1",
            business_name: "Silk Road Tours",
            role: "agency",
            status: "pending",
            documents_url: "https://example.com/doc1",
            created_at: new Date().toISOString(),
            email: "contact@silkroad.uz"
          },
          {
            id: "req-2",
            user_id: "usr-2",
            business_name: "Samarkand Stays",
            role: "provider",
            status: "pending",
            documents_url: "https://example.com/doc2",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            email: "hello@samarkandstays.com"
          }
        ]);
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('provider_verifications')
        .update({ status: newStatus } as any)
        .eq('id', id);

      if (error && error.code !== '42P01') throw error;

      // Update local state (works even for mock data)
      setVerifications(prev => 
        prev.map(v => v.id === id ? { ...v, status: newStatus } : v)
      );
      
      // Simple UI toast substitute for Stage 1
      alert(`Request successfully ${newStatus}!`);

    } catch (err: any) {
      console.error("Failed to update status:", err);
      alert("Failed to update status: " + err.message);
    }
  };

  const selectedRequest = verifications.find(v => v.id === selectedId) || null;

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Verification Hub</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve new provider and agency registrations.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load verifications: {error}
        </div>
      ) : isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_320px] gap-6">
          <DataTable 
            data={verifications} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
          />
          <DetailsPanel 
            selectedRequest={selectedRequest}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
      )}
    </div>
  );
}
