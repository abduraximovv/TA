import React from 'react';
import { SurvivalMap } from '../../../components/map/SurvivalMap';

export default function MapPage() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  if (!mapboxToken) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center">
        <p className="text-gray-500">
          Mapbox access token is missing. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full h-full min-h-screen pt-16">
      {/* 
        Header could go here (e.g. Floating search bar).
        The map takes the remaining space.
      */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <input 
          type="text" 
          placeholder="Search places..." 
          className="flex-1 h-12 px-4 rounded-full shadow-md bg-white text-gray-900 border-none outline-none focus:ring-2 focus:ring-[#1E6F8A]"
        />
      </div>
      <SurvivalMap mapboxAccessToken={mapboxToken} />
    </main>
  );
}
