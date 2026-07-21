"use client";

import React, { useEffect, useState } from "react";
import { getSupabase } from "@repo/database";
import { Card, Button, Toast } from "@repo/ui";
import { approveAgency, rejectAgency } from "../actions/agencyActions";
import { Building2, Mail, Phone, CheckCircle, XCircle, Clock } from "lucide-react";

interface AgencyRequest {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function VerificationHub() {
  const [requests, setRequests] = useState<AgencyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const supabase = getSupabase();
    // In a real app with RLS restricting SELECTs, the user must be an admin.
    // For this demonstration, we assume the admin's session satisfies the RLS policy.
    const { data, error } = await supabase
      .from("agency_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
    setIsLoading(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
  };

  const handleApprove = async (request: AgencyRequest) => {
    setProcessingId(request.id);
    try {
      const result = await approveAgency(request.id, request.email, request.company_name);
      if (result.success) {
        showToast(`Approved! Temp Password: ${result.tempPassword}`);
        await fetchRequests();
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const result = await rejectAgency(id);
      if (result.success) {
        showToast("Request rejected.");
        await fetchRequests();
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto" data-testid="verification-hub-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Verification Hub</h1>
        <p className="text-gray-500 mt-2">Review and manage onboarding requests for agencies.</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
              No agency requests found.
            </div>
          ) : (
            requests.map((req) => (
              <Card key={req.id} className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[#1E6F8A]" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center ${
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {req.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {req.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {req.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                    {req.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{req.company_name}</h3>
                
                <div className="space-y-2 mt-4 flex-grow">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{req.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{req.phone || "Not provided"}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mt-4 mb-4">
                  Applied on {new Date(req.created_at).toLocaleDateString()}
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                    <Button 
                      className="flex-1 rounded-lg bg-[#1E6F8A] hover:bg-[#155368] text-white py-2 font-semibold shadow-sm"
                      onClick={() => handleApprove(req)}
                      disabled={processingId === req.id}
                    >
                      {processingId === req.id ? "Processing..." : "Approve"}
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 py-2 font-semibold"
                      onClick={() => handleReject(req.id)}
                      disabled={processingId === req.id}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      <Toast message={toastMessage} isVisible={isToastVisible} onClose={() => setIsToastVisible(false)} />
    </div>
  );
}
