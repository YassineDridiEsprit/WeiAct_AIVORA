import React from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Create custom rose-purple marker icon
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #f43f5e, #a855f7);
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 14px;
        font-weight: bold;
      ">📍</div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

interface Parcel {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  boundary?: {
    coordinates: number[][][];
  };
  area_hectares?: number;
}

interface FarmMapProps {
  parcels: Parcel[];
  focusParcel?: Parcel | null;
}

const MapController: React.FC<{ boundary?: { coordinates: number[][][] } }> = ({ boundary }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!map || !boundary?.coordinates) return;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon) map.removeLayer(layer);
    });

    // Transform coordinates from [lng, lat] to [lat, lng] for Leaflet
    const transformedCoordinates = boundary.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);

    // Add new polygon with rose-purple styling
    const polygon = L.polygon(transformedCoordinates, {
      color: '#f43f5e',
      fillColor: '#fce7f3',
      fillOpacity: 0.3,
      weight: 3,
    }).addTo(map);

    // Zoom to parcel bounds
    map.fitBounds(polygon.getBounds(), { padding: [50, 50] });

  }, [map, boundary]);

  return null;
};

// Component for rendering parcel markers with popups
const ParcelMarker: React.FC<{ parcel: Parcel }> = ({ parcel }) => {
  // Use coordinates from either latitude/longitude or boundary center
  let lat = parcel.latitude;
  let lng = parcel.longitude;
  
  // If no direct coordinates, calculate center from boundary
  if (!lat || !lng) {
    if (parcel.boundary?.coordinates?.[0]?.length) {
      const coords = parcel.boundary.coordinates[0];
      lat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
      lng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
    }
  }
  
  if (!lat || !lng) return null;

  return (
    <Marker position={[lat, lng]} icon={customIcon}>
      <Popup className="custom-popup">
        <div className="p-3 min-w-[200px]">
          <h3 className="text-lg font-bold text-gray-900 mb-2 bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
            {parcel.name}
          </h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              <span className="font-medium">Area:</span> {parcel.area_hectares} hectares
            </p>
            {parcel.culture && (
              <p className="text-purple-700">
                <span className="font-medium">Culture:</span> <span className="capitalize">{parcel.culture}</span>
              </p>
            )}
            {parcel.soil_type && (
              <p className="text-gray-600">
                <span className="font-medium">Soil:</span> <span className="capitalize">{parcel.soil_type}</span>
              </p>
            )}
            <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded mt-2">
              📍 {typeof lat === 'number' ? lat.toFixed(4) : parseFloat(lat).toFixed(4)}, {typeof lng === 'number' ? lng.toFixed(4) : parseFloat(lng).toFixed(4)}
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const FarmMap: React.FC<FarmMapProps> = ({ parcels, focusParcel }) => {
  // Calculate center from parcels or use Tunisia default
  const getMapCenter = (): [number, number] => {
    if (parcels.length === 0) return [34, 9.5]; // Tunisia center
    
    const validParcels = parcels.filter(p => (p.latitude && p.longitude) || p.boundary?.coordinates);
    if (validParcels.length === 0) return [34, 9.5];
    
    let totalLat = 0, totalLng = 0, count = 0;
    
    validParcels.forEach(parcel => {
      if (parcel.latitude && parcel.longitude) {
        totalLat += typeof parcel.latitude === 'number' ? parcel.latitude : parseFloat(parcel.latitude);
        totalLng += typeof parcel.longitude === 'number' ? parcel.longitude : parseFloat(parcel.longitude);
        count++;
      } else if (parcel.boundary?.coordinates?.[0]) {
        const coords = parcel.boundary.coordinates[0];
        const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
        const centerLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
        totalLat += centerLat;
        totalLng += centerLng;
        count++;
      }
    });
    
    return count > 0 ? [totalLat / count, totalLng / count] : [34, 9.5];
  };

  const mapCenter = getMapCenter();
  const defaultZoom = parcels.length > 0 ? 12 : 7;

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Render parcel boundaries */}
        {parcels.map((parcel) => {
          if (!parcel.boundary?.coordinates?.[0]) return null;

          return (
            <Polygon
              key={`polygon-${parcel.id}`}
              positions={parcel.boundary.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number])}
              pathOptions={{
                color: '#f43f5e',
                fillColor: '#fce7f3',
                fillOpacity: 0.3,
                weight: 3,
              }}
            />
          );
        })}
        
        {/* Render parcel markers */}
        {parcels.map((parcel) => (
          <ParcelMarker key={`marker-${parcel.id}`} parcel={parcel} />
        ))}

        {focusParcel && focusParcel.boundary && <MapController boundary={focusParcel.boundary} />}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200 z-[1000]">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-gray-800">
            <div className="w-4 h-4 border-2 border-rose-500 bg-rose-50 rounded"></div>
            <span>Parcel Boundary</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-gray-800">
            <div className="w-3 h-3 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full"></div>
            <span>Parcel Location</span>
          </div>
        </div>
        <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
          Total: {parcels.length} parcel{parcels.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default FarmMap;