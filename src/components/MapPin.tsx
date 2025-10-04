import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

interface Parcel {
  id: number;
  name: string;
  boundary?: {
    coordinates: number[][][];
  };
  // Add other fields if needed (e.g., latitude?: number; longitude?: number;)
}

const MapPin: React.FC<{ parcel: Parcel }> = ({ parcel }) => {
  // Guard: No boundary, no pin
  if (!parcel.boundary?.coordinates || parcel.boundary.coordinates.length === 0) {
    return null;
  }

  // Create GeoJSON polygon from boundary coordinates (api.ts format: { coordinates: number[][][] })
  const geoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: parcel.boundary.coordinates,
    },
  };

  // Calculate the center of the parcel’s boundary for marker placement
  const bounds = L.geoJSON(geoJSON).getBounds();
  const center = bounds.getCenter();

  // Create a custom icon with the parcel name
  const icon = L.divIcon({
    className: 'map-pin',
    html: `
      <div style="
        background: #2e7d32;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        font-weight: bold;
      ">
        ${parcel.name}
      </div>
    `,
    iconSize: [0, 0], // Let the content determine the size
    iconAnchor: [0, 0], // Position the icon at the marker’s point (top-left of the div)
  });

  return (
    <Marker
      position={center}
      icon={icon}
      interactive={false} // Disable click interactions
    />
  );
};

export default MapPin;