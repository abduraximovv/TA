"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@repo/database";
import { Toast } from "@repo/ui";
import { DataTable } from "../../components/verifications/DataTable";
import { DetailsPanel } from "../../components/verifications/DetailsPanel";
import { ProviderVerification } from "./types";
import { approveUser, rejectUser } from "../actions/verificationActions";

export default function VerificationHubPage() {
  const [verifications, setVerifications] = useState<ProviderVerification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchVerifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("provider_verifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVerifications((data ?? []) as ProviderVerification[]);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch verifications:", err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerifications();

    const supabase = getSupabase();
    const channel = supabase
      .channel("verification-hub")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "provider_verifications" },
        () => fetchVerifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVerifications]);

  const handleApprove = async (id: string) => {
    const request = verifications.find((v) => v.id === id);
    if (!request) return;
    try {
      await approveUser(id, request.user_id);
      setToastMessage(`${request.business_name} approved — access granted.`);
      await fetchVerifications();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : "Failed to approve request.");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    const request = verifications.find((v) => v.id === id);
    if (!request) return;
    try {
      await rejectUser(id, reason);
      setToastMessage(`${request.business_name} rejected.`);
      await fetchVerifications();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : "Failed to reject request.");
    }
  };

  const selectedRequest = verifications.find((v) => v.id === selectedId) || null;

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
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      )}

      <Toast
        message={toastMessage ?? ""}
        isVisible={toastMessage !== null}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
