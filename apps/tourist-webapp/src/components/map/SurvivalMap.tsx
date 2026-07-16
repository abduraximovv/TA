"use client";

import React, { useRef, useState, useCallback, useMemo } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import useSupercluster from 'use-supercluster';
import { MapPin, MapInfoCard } from '@repo/ui';
import type { Location } from '@repo/database';
import { useMapPins } from '../../hooks/useMapPins';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SurvivalMapProps {
  mapboxAccessToken: string;
}

export function SurvivalMap({ mapboxAccessToken }: SurvivalMapProps) {
  const mapRef = useRef<any>(null);
  
  // Initial viewport (Tashkent center for example)
  const [viewState, setViewState] = useState({
    longitude: 69.2401,
    latitude: 41.2995,
    zoom: 12
  });

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  const { locations, fetchPins, isLoading } = useMapPins();

  // Fetch pins when map stops moving
  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    const mapBounds = map.getBounds();
    setBounds([
      mapBounds.getWest(),
      mapBounds.getSouth(),
      mapBounds.getEast(),
      mapBounds.getNorth()
    ]);
    
    const center = map.getCenter();
    // Fetch pins in 10km radius from map center
    fetchPins(center.lat, center.lng, 10000);
  }, [fetchPins]);

  // Convert locations to GeoJSON features for supercluster
  const points = useMemo(() => {
    return locations.map(loc => ({
      type: "Feature" as const,
      properties: { cluster: false, locationId: loc.id, category: loc.category, locationData: loc },
      geometry: { type: "Point" as const, coordinates: [loc.lng, loc.lat] }
    }));
  }, [locations]);

  // Setup supercluster
  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: bounds || undefined,
    zoom: viewState.zoom,
    options: { radius: 75, maxZoom: 16 }
  });

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-4rem)]">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        onLoad={handleMoveEnd} // Initial fetch
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxAccessToken}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl 
          position="bottom-right" 
          trackUserLocation={true}
          showAccuracyCircle={false}
        />

        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const properties = cluster.properties as any;
          const isCluster = properties.cluster;
          const locationData = properties.locationData;

          if (isCluster) {
            const pointCount = properties.point_count;
            // Render cluster marker
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
                anchor="center"
              >
                <div 
                  className="w-10 h-10 rounded-full bg-[#1E6F8A] text-white flex items-center justify-center font-bold shadow-lg cursor-pointer border-2 border-white ring-2 ring-black/5"
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id as number),
                      20
                    );
                    mapRef.current?.flyTo({
                      center: [longitude, latitude],
                      zoom: expansionZoom,
                      duration: 500
                    });
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          // Render individual pin
          return (
            <Marker
              key={`location-${locationData.id}`}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
            >
              <MapPin 
                category={locationData.category}
                selected={selectedLocation?.id === locationData.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLocation(locationData);
                }}
              />
            </Marker>
          );
        })}
      </Map>

      {/* Loading overlay for data fetch */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-sm text-gray-600">
          Updating map...
        </div>
      )}

      {/* Bottom Sheet Info Card */}
      <MapInfoCard 
        open={!!selectedLocation}
        onOpenChange={(open) => {
          if (!open) setSelectedLocation(null);
        }}
        title={selectedLocation?.name || ''}
        category={selectedLocation?.category || ''}
        description={selectedLocation?.description}
        distance={selectedLocation?.distance_meters}
        onGetDirections={() => {
          if (selectedLocation) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`, '_blank');
          }
        }}
      />
    </div>
  );
}
