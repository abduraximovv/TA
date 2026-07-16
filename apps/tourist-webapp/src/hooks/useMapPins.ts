import { useState, useEffect, useCallback } from 'react';
import { fetchLocationsInRadius, type Location } from '@repo/database';

export function useMapPins() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPins = useCallback(async (lat: number, lng: number, radiusMeters: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLocationsInRadius(lat, lng, radiusMeters);
      setLocations(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch locations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    locations,
    isLoading,
    error,
    fetchPins
  };
}
