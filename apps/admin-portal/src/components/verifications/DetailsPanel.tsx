"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, FileText, User, Mail, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ProviderVerification } from "../../app/verifications/types";

interface DetailsPanelProps {
  selectedRequest: ProviderVerification | null;
  onUpdateStatus: (id: string, newStatus: 'approved' | 'rejected') => Promise<void>;
}

export function DetailsPanel({ selectedRequest, onUpdateStatus }: DetailsPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!selectedRequest) {
    return (
      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">No Request Selected</h3>
        <p className="text-xs text-gray-500 max-w-[200px]">Select a verification request from the table to view its details and take action.</p>
      </div>
    );
  }

  const handleAction = async (status: 'approved' | 'rejected') => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedRequest.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col relative overflow-hidden">
      {/* Decorative header line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1E6F8A] to-blue-400" />
      
      <div className="p-5 border-b border-gray-100 mt-1">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
          {selectedRequest.business_name || "Unknown Business"}
        </h2>
        <div className="flex items-center mt-2 space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1E6F8A] uppercase tracking-wider">
            {selectedRequest.role}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs font-medium text-gray-500">
            ID: {selectedRequest.id.split('-')[0]}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Profile Info */}
        <section>
          <h3 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Profile Information</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start">
              <User className="w-4 h-4 text-gray-400 mt-0.5 mr-3 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Applicant Name</p>
                <p className="text-sm font-semibold text-gray-900">Pending Setup</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 mr-3 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Email Address</p>
                <p className="text-sm font-semibold text-gray-900">{selectedRequest.email || "No email linked"}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 mr-3 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Submission Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {format(new Date(selectedRequest.created_at), "PPp")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section>
          <h3 className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Uploaded Documents</h3>
          {selectedRequest.documents_url ? (
            <a 
              href={selectedRequest.documents_url} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center p-3 bg-blue-50/50 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center mr-3 shadow-sm border border-blue-100 group-hover:border-blue-200">
                <FileText className="w-5 h-5 text-[#1E6F8A]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1E6F8A] transition-colors">Business_License.pdf</p>
                <p className="text-[10px] font-medium text-blue-600/60 uppercase tracking-wide">View Document</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-center">
              <p className="text-xs font-medium text-gray-500">No documents provided</p>
            </div>
          )}
        </section>
      </div>

      {/* Actions */}
      <div className="p-5 border-t border-gray-100 bg-gray-50/50">
        {selectedRequest.status === 'pending' ? (
          <div className="flex space-x-3">
            <button
              onClick={() => handleAction('rejected')}
              disabled={isUpdating}
              className="flex-1 bg-white border border-[#C93B3B]/20 text-[#C93B3B] hover:bg-[#C93B3B]/5 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
              Reject
            </button>
            <button
              onClick={() => handleAction('approved')}
              disabled={isUpdating}
              className="flex-1 bg-[#2D8A4E] hover:bg-[#236b3d] text-white font-semibold py-2.5 px-4 rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Approve
            </button>
          </div>
        ) : (
          <div className={`p-3 rounded-lg border flex items-center justify-center ${
            selectedRequest.status === 'approved' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {selectedRequest.status === 'approved' ? (
              <><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> <span className="text-sm font-semibold">Approved</span></>
            ) : (
              <><XCircle className="w-4 h-4 mr-2 text-red-600" /> <span className="text-sm font-semibold">Rejected</span></>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
