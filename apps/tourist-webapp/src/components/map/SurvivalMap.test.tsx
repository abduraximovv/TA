import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SurvivalMap } from './SurvivalMap';

// Mock react-map-gl
vi.mock('react-map-gl/mapbox', () => ({
  default: ({ children }: any) => <div data-testid="mapbox-mock">{children}</div>,
  Marker: ({ children }: any) => <div data-testid="mapbox-marker">{children}</div>,
  NavigationControl: () => <div />,
  GeolocateControl: () => <div />
}));

// Mock useMapPins hook
const mockFetchPins = vi.fn();
vi.mock('../../hooks/useMapPins', () => ({
  useMapPins: () => ({
    locations: [
      { id: '1', lat: 41.3, lng: 69.2, category: 'food', name: 'Plov Center' }
    ],
    isLoading: false,
    fetchPins: mockFetchPins
  })
}));

describe('SurvivalMap', () => {
  it('renders the map and pins', async () => {
    render(<SurvivalMap mapboxAccessToken="fake-token" />);
    
    expect(screen.getByTestId('mapbox-mock')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getAllByTestId('mapbox-marker').length).toBeGreaterThan(0);
    });
  });
});
