import React from "react";
import Link from "next/link";
import { Button } from "@repo/ui";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor - Image or gradient matching UzTour aesthetic */}
      <div className="absolute inset-0 bg-[#1E6F8A] z-0">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Frosted Glass Success Card */}
        <div className="p-10 border border-white/20 shadow-2xl rounded-3xl bg-white/10 backdrop-blur-xl text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-green-400/30">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-md">
            Application Submitted
          </h1>
          
          <p className="text-white/90 text-lg mb-8 leading-relaxed font-medium">
            Thank you for applying to join the UzTour ecosystem. Our admin team will review your business details shortly.
            <br className="hidden sm:block" />
            <br className="hidden sm:block" />
            You will receive an email with your secure login credentials once your agency has been verified and approved.
          </p>

          <Link href="/">
            <Button className="w-full sm:w-auto px-8 py-6 rounded-xl bg-white text-[#1E6F8A] hover:bg-gray-50 font-bold text-lg shadow-xl transition-transform hover:-translate-y-1">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
