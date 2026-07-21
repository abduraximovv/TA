import React from "react";
import Link from "next/link";
import { getSupabase } from "@repo/database";
import { Button } from "@repo/ui";
import { ArrowLeft, Star, Clock, MapPin, CheckCircle } from "lucide-react";

export const revalidate = 3600;

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabase();
  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
        <p className="text-gray-500 mb-6">The experience you are looking for does not exist or has been removed.</p>
        <Link href="/discover">
          <Button className="bg-[#1E6F8A]">Return to Discover</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Media Gallery / Header */}
      <div className="relative h-[40vh] bg-gray-200">
        <img 
          src={service.image_url || "https://images.unsplash.com/photo-1524317420516-7fc1154c1fce?q=80&w=1200"} 
          alt={service.title || "Service image"}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
          <Link href="/discover" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 -mt-8 relative z-10 bg-white rounded-t-3xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-[#D4A843] uppercase mb-2">
              {service.category || "Authentic Experience"}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {service.title || "Samarkand Cultural Masterclass"}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 border-b border-gray-100 pb-6">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-[#D4A843] fill-[#D4A843] mr-1" />
            <span className="font-semibold text-gray-900 mr-1">{service.avg_rating || "4.9"}</span> (124 reviews)
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" /> 2 Hours
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" /> Samarkand
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">About this experience</h2>
          <p className="text-gray-600 leading-relaxed">
            {service.description || "Immerse yourself in the rich history of Uzbekistan. Learn the traditional methods of crafting authentic ceramics from a master artisan, whose family has passed down these techniques for over 6 generations."}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">What's Included</h2>
          <ul className="space-y-3">
            <li className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" /> All necessary materials
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" /> Traditional Uzbek tea and sweets
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" /> English speaking guide
            </li>
          </ul>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] flex items-center justify-between z-50">
        <div>
          <div className="text-xs text-gray-500 font-medium">Price per person</div>
          <div className="text-xl font-bold text-gray-900">
            {service.price ? new Intl.NumberFormat('uz-UZ').format(service.price) : "250,000"} <span className="text-sm font-normal text-gray-500">UZS</span>
          </div>
        </div>
        <Button className="bg-[#1E6F8A] hover:bg-[#155368] px-8 h-12 rounded-lg text-base font-semibold shadow-lg shadow-[#1E6F8A]/20">
          Request Booking
        </Button>
      </div>

    </main>
  );
}
