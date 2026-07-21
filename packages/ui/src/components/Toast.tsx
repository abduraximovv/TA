"use client";

import React, { useEffect } from "react";
import { X, Info } from "lucide-react";
import { twMerge } from "tailwind-merge";

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

export function Toast({ message, isVisible, onClose, className }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={twMerge("flex items-center gap-3 bg-gray-900/90 backdrop-blur-md text-white px-5 py-3 rounded-xl shadow-2xl border border-white/10", className)}>
        <Info className="w-5 h-5 text-[#D4A843]" />
        <span className="text-sm font-medium tracking-wide">{message}</span>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors focus:outline-none">
          <X className="w-4 h-4 text-gray-300" />
        </button>
      </div>
    </div>
  );
}
