"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full flex flex-col items-center space-y-6">
        <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center">
          <WifiOff className="h-10 w-10 text-amber-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">You're Offline</h1>
          <p className="text-gray-500">
            Please check your internet connection to manage your services on Safron Provider.
          </p>
        </div>
        
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
