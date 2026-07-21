import React from "react";
import Link from "next/link";
import { getSupabase } from "@repo/database";
import { Card } from "@repo/ui";
import { MapPin, Star, Compass } from "lucide-react";

export const revalidate = 3600; // Cache data for 1 hour for performance

export default async function DiscoverPage() {
  const supabase = getSupabase();

  // Fetch real data from Supabase
  // We use Promise.all to fetch them in parallel for speed
  const [
    { data: services, error: servicesError },
    { data: locations, error: locationsError }
  ] = await Promise.all([
    supabase.from("services").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("locations").select("*").limit(5)
  ]);

  if (servicesError || locationsError) {
    console.error("Error fetching data:", servicesError || locationsError);
  }

  // Ensure we have arrays even if fetch fails
  const safeServices: any[] = services || [];
  const safeLocations: any[] = locations || [];

  return (
    <main className="flex flex-col min-h-screen pb-24 pt-8 px-4 bg-[#F9FAFB] selection:bg-[#1E6F8A]/20">
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Discover <span className="text-[#1E6F8A]">Uzbekistan</span>
        </h1>
        <p className="text-gray-500 text-sm">Find verified experiences and essential locations.</p>
      </header>

      {/* Services Carousel */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Compass className="w-5 h-5 text-[#D4A843] mr-2" />
            Curated Experiences
          </h2>
          <Link href="/discover/experiences" className="text-[#1E6F8A] text-sm font-medium hover:underline">
            View All
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {safeServices.length > 0 ? (
            safeServices.map((service) => (
              <Link 
                href={`/service/${service.id}`} 
                key={service.id} 
                className="snap-start shrink-0 outline-none group"
              >
                <Card className="w-64 h-[320px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow relative">
                  <div className="h-40 w-full bg-gray-200 relative overflow-hidden">
                    <img 
                      src={service.image_url || "https://images.unsplash.com/photo-1524317420516-7fc1154c1fce?q=80&w=600"} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-900 flex items-center shadow-sm">
                      <Star className="w-3 h-3 text-[#D4A843] fill-[#D4A843] mr-1" />
                      {service.avg_rating || "4.9"}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between h-[calc(320px-160px)]">
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-[#1E6F8A] uppercase mb-1">
                        {service.category || "Experience"}
                      </div>
                      <h3 className="text-gray-900 font-bold leading-tight line-clamp-2">
                        {service.title || "Authentic Uzbekistan Tour"}
                      </h3>
                    </div>
                    <div className="mt-3 font-semibold text-gray-900">
                      {service.price ? new Intl.NumberFormat('uz-UZ').format(service.price) : "250,000"} <span className="text-xs text-gray-500 font-normal">UZS</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl">
              <span className="text-gray-400 text-sm font-medium">No experiences found.</span>
            </div>
          )}
        </div>
      </section>

      {/* Locations Summary */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 text-[#1E6F8A] mr-2" />
            Essential Hubs
          </h2>
          <Link href="/map" className="text-[#1E6F8A] text-sm font-medium hover:underline">
            Open Map
          </Link>
        </div>

        <div className="flex flex-col space-y-3">
          {safeLocations.length > 0 ? (
            safeLocations.map((loc) => (
              <Card key={loc.id} className="p-4 flex items-center border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                  loc.category === 'sos' ? 'bg-red-50 text-red-600' :
                  loc.category === 'pharmacy' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-[#1E6F8A]'
                }`}>
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{loc.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{loc.category.replace('_', ' ')}</p>
                </div>
              </Card>
            ))
          ) : (
            <div className="w-full p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl">
              <span className="text-gray-400 text-sm font-medium">No locations found.</span>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
