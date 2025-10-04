import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Edit, Trash2, MapPin as MapPinIcon, Calendar, Ruler } from 'lucide-react';
import MapPin from './MapPin';

interface Parcel {
  id: number;
  name: string;
  culture: string;
  soil_type: string;
  area_hectares: number;
  location?: string;
  perimeter_km?: number;
  created_at: string;
  boundary?: {
    coordinates: number[][][];
  };
}

interface ParcelListProps {
  parcels: Parcel[];
  onUpdate: (parcel: Parcel) => void;
  onDelete: (id: number) => void;
}

const MapController: React.FC<{ boundary?: { coordinates: number[][][] } }> = ({ boundary }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!map || !boundary?.coordinates) return;

    // Clear existing polygon layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon) map.removeLayer(layer);
    });

    // Transform coordinates from [lng, lat] to [lat, lng] for Leaflet
    const transformedCoordinates = boundary.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);

    // Add new polygon
    const polygon = L.polygon(transformedCoordinates, {
      color: '#2e7d32',
      fillColor: '#81c784',
      fillOpacity: 0.4,
    }).addTo(map);

    // Zoom to parcel bounds
    map.fitBounds(polygon.getBounds(), { padding: [50, 50] });
  }, [map, boundary]);

  return null;
};

const getCultureColor = (culture: string) => {
  const colors: { [key: string]: string } = {
    ORANGE: 'bg-orange-100 text-orange-800',
    POTATO: 'bg-yellow-100 text-yellow-800',
    TOMATO: 'bg-red-100 text-red-800',
    LEMON: 'bg-yellow-100 text-yellow-800',
    OLIVE: 'bg-green-100 text-green-800',
    PEACH: 'bg-pink-100 text-pink-800',
    WHEAT: 'bg-amber-100 text-amber-800',
    BARLEY: 'bg-amber-100 text-amber-800',
    NONE: 'bg-gray-100 text-gray-800',
  };
  return colors[culture.toUpperCase()] || 'bg-gray-100 text-gray-800';
};

const getSoilColor = (soil: string) => {
  const colors: { [key: string]: string } = {
    clay: 'bg-red-100 text-red-800',
    silt: 'bg-blue-100 text-blue-800',
    sand: 'bg-yellow-100 text-yellow-800',
    loam: 'bg-green-100 text-green-800',
  };
  return colors[soil.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

const ParcelTableRow: React.FC<{ parcel: Parcel; onUpdate: (parcel: Parcel) => void; onDelete: (id: number) => void }> = ({
  parcel,
  onUpdate,
  onDelete,
}) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-rose-100 to-purple-100 p-2 rounded-lg">
            <MapPinIcon className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{parcel.name}</div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCultureColor(parcel.culture)}`}>
                {parcel.culture}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSoilColor(parcel.soil_type)}`}>
                {parcel.soil_type.charAt(0).toUpperCase() + parcel.soil_type.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        <div className="space-y-1">
          {parcel.location && (
            <div className="flex items-center space-x-1">
              <MapPinIcon className="h-3 w-3" />
              <span className="truncate max-w-32">{parcel.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Ruler className="h-3 w-3" />
            <span>{parcel.area_hectares} ha</span>
            {parcel.perimeter_km && <span>• {parcel.perimeter_km} km</span>}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>
            {parcel.created_at && !isNaN(Date.parse(parcel.created_at)) 
              ? new Date(parcel.created_at).toLocaleDateString()
              : 'Just now'
            }
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onUpdate(parcel)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this parcel?')) {
                onDelete(parcel.id);
              }
            }}
            className="text-red-600 hover:text-red-800 p-1 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const ParcelList: React.FC<ParcelListProps> = ({ parcels, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParcels = (parcels || [])
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .filter((parcel) =>
      [parcel.name, parcel.culture, parcel.soil_type].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search parcels by name, culture, or soil..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
        />
        <svg
          className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-rose-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Parcel Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location & Size</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredParcels.map((parcel) => (
                <ParcelTableRow key={parcel.id} parcel={parcel} onUpdate={onUpdate} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
          {filteredParcels.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <div className="text-gray-400 mb-6">
                <MapPinIcon className="mx-auto h-16 w-16" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                {parcels?.length ? 'No matching parcels found' : 'No parcels yet'}
              </h3>
              <p className="text-gray-500 text-base">
                {parcels?.length 
                  ? 'Try adjusting your search terms to find the parcels you\'re looking for.'
                  : 'Add your first parcel to get started with farm management.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParcelList;