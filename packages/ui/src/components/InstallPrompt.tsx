"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "./Button";

export function InstallPrompt() {
  const [isReadyForInstall, setIsReadyForInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsReadyForInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app is already installed
    window.addEventListener("appinstalled", () => {
      setIsReadyForInstall(false);
      setDeferredPrompt(null);
      console.log("PWA was installed");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsReadyForInstall(false);
    }
    setDeferredPrompt(null);
  };

  if (!isReadyForInstall) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-md mx-auto bg-white rounded-t-xl sm:rounded-xl shadow-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">Install App</h4>
            <p className="text-xs text-gray-500">Add to home screen for faster access & offline support</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={installApp} className="whitespace-nowrap px-4 py-1.5 h-auto text-xs">
            Install
          </Button>
          <button 
            onClick={() => setIsReadyForInstall(false)} 
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
