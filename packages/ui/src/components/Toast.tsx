"use client";

import React, { useEffect } from "react";
import { X, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
  variant?: "default" | "success" | "danger";
}

export function Toast({ message, isVisible, onClose, className, variant = "default" }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-[#2D8A4E]/90 text-white border-[#2D8A4E]";
      case "danger":
        return "bg-[#C93B3B]/90 text-white border-[#C93B3B]";
      default:
        return "bg-gray-900/90 text-white border-white/10";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-white" />;
      case "danger":
        return <AlertCircle className="w-5 h-5 text-white" />;
      default:
        return <Info className="w-5 h-5 text-[#C5A880]" />;
    }
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={twMerge("flex items-center gap-3 backdrop-blur-md px-5 py-3 rounded-xl shadow-2xl border", getVariantStyles(), className)}>
        {getIcon()}
        <span className="text-sm font-medium tracking-wide">{message}</span>
        <button onClick={onClose} className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors focus:outline-none">
          <X className="w-4 h-4 text-white/80" />
        </button>
      </div>
    </div>
  );
}
