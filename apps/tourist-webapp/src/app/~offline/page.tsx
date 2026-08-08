"use client";

import { WifiOff, Compass } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#F9F8F5] text-center">
      <div className="max-w-md w-full flex flex-col items-center space-y-10">
        
        {/* Animated Compass / Wifi Icon container */}
        <div className="relative h-28 w-28 bg-[#C5A880]/10 rounded-full flex items-center justify-center border border-[#C5A880]/20">
          <div className="absolute inset-0 rounded-full border border-[#0A2320]/10 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          <Compass className="absolute h-14 w-14 text-[#C5A880] opacity-20 animate-[spin_10s_linear_infinite]" />
          <WifiOff className="h-10 w-10 text-[#0A2320] z-10" />
        </div>
        
        <div className="space-y-4 px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0A2320] tracking-tight">
            You're Offline
          </h1>
          <p className="text-lg text-gray-500 font-sans leading-relaxed">
            The Silk Road is vast, and you seem to have lost your connection. Check your network to continue exploring Safron.
          </p>
        </div>
        
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-10 py-4 bg-[#0A2320] text-white font-medium text-lg rounded-full hover:bg-black transition-colors tap-target tap-active"
        >
          Reconnect
        </button>
      </div>
    </div>
  );
}
