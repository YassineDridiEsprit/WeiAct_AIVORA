import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import L, { LatLng, LatLngLiteral, FeatureGroup } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import 'leaflet-geometryutil';
import { farmAPI } from '../lib/api';

// Extend Leaflet types
declare module 'leaflet' {
  interface LeafletEvent {
    originalEvent?: Event; // Fix 'originalEvent' does not exist
  }
  namespace GeometryUtil {
    function length(latlngs: L.LatLng[] | LatLngLiteral[]): number;
    function geodesicArea(latlngs: L.LatLng[] | LatLngLiteral[]): number;
  }
  namespace Control {
    interface Draw {
      _toolbars: {
        // Fix '_toolbars' does not exist
        draw: {
          _modes: {
            polygon: {
              handler: {
                disable: () => void;
              };
            };
          };
        };
      };
    }
  }
  namespace DrawEvents {
    interface DrawVertex {
      layers: L.LayerGroup;
    }
    interface Edited {
      layers: L.LayerGroup;
    }
    interface Deleted {
      layers: L.LayerGroup;
    }
  }
}

interface Parcel {
  id: number;
  name: string;
  culture: string;
  soil_type: string;
  area_hectares?: number;
  perimeter_km?: number;
  boundary?: {
    coordinates: number[][][];
  };
}

interface ParcelFormProps {
  open: boolean;
  onClose: () => void;
  onParcelCreated: (parcel: Parcel) => void;
  existingParcel?: Parcel | null;
}

// Custom CSS
const customCSS = `
  .leaflet-container { cursor: crosshair; }
  .leaflet-draw-vertex {
    width: 6px !important;
    height: 6px !important;
    margin: -3px 0 0 -3px !important;
    background: #fff !important;
    border: 2px solid #2e7d32 !important;
    border-radius: 50% !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .segment-tooltip {
    background-color: #2e7d32;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
`;

if (typeof document !== 'undefined') {
  document.head.insertAdjacentHTML('beforeend', `<style>${customCSS}</style>`);
}

const MapDrawer: React.FC<{
  onPolygonComplete: (coords: number[][]) => void;
  setMeasurements: (measurements: { perimeter: string; area: string }) => void;
  initialCoords?: number[][];
}> = ({ onPolygonComplete, setMeasurements, initialCoords }) => {
  const map = useMap();
  const [drawnLayer, setDrawnLayer] = useState<L.Polygon | null>(null);
  const [featureGroup] = useState<L.FeatureGroup>(new L.FeatureGroup());
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawControl, setDrawControl] = useState<L.Control.Draw | null>(null);
  const [lastCreatedTime, setLastCreatedTime] = useState<number>(0);

  useEffect(() => {
    if (!map) return;
    
    // Prevent multiple initializations
    if (drawControl) {
      console.log('DrawControl already exists, skipping initialization');
      return;
    }
    
    console.log('Map instance:', map); // Debug map instance

    let tooltipLayers: L.Tooltip[] = [];
    let latlngs: L.LatLng[] = [];

    // Cleanup previous draw controls and layers
    if (drawnLayer) {
      featureGroup.removeLayer(drawnLayer);
    }
    featureGroup.clearLayers();
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon && layer !== drawnLayer) {
        map.removeLayer(layer);
      }
    });

    // Add feature group to map
    map.addLayer(featureGroup);

    // Initialize draw control
    const newDrawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: false, // Disabled to avoid readableArea error
          drawError: { color: '#e63946', message: 'No intersecting shapes!' },
          shapeOptions: { color: '#2e7d32', weight: 2 },
          metric: true,
          repeatMode: true,
        },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: {
        featureGroup,
        remove: true, // Enable delete button
      },
    });
    map.addControl(newDrawControl);
    setDrawControl(newDrawControl);
    console.log('Draw control initialized:', newDrawControl); // Debug draw control

    // Add initial polygon if provided
    if (initialCoords && !drawnLayer) {
      const latLngs = initialCoords.map(([lat, lng]) => new L.LatLng(lat, lng));
      const polygon = L.polygon(latLngs, {
        color: '#2e7d32',
        weight: 2,
        fillColor: '#81c784',
        fillOpacity: 0.7,
      });
      featureGroup.addLayer(polygon);
      setDrawnLayer(polygon);

      const perimeter = L.GeometryUtil.length(latLngs);
      const area = L.GeometryUtil.geodesicArea(latLngs);
      setMeasurements({
        perimeter: `${(perimeter / 1000).toFixed(2)} km`,
        area: `${(area / 10000).toFixed(2)} ha`,
      });
    }

    // Event handlers
    map.on('draw:drawstart', (e) => {
      const target = e.target as L.Map;
      if (target.getContainer().contains(e.originalEvent?.target as Node)) {
        console.log('Draw started'); // Debug
        setIsDrawing(true);
        tooltipLayers.forEach((l) => map.removeLayer(l));
        tooltipLayers = [];
        latlngs = [];
      }
    });

    map.on('draw:drawvertex', (e: L.LeafletEvent) => {
      console.log('Vertex added', e); // Debug
      const event = e as L.DrawEvents.DrawVertex;
      latlngs = event.layers.getLayers().map((l: L.Layer) => (l as L.Marker).getLatLng());

      if (latlngs.length < 2) return;

      const last = latlngs[latlngs.length - 1];
      const prev = latlngs[latlngs.length - 2];

      const dist = map.distance(prev, last);
      const midLat = (prev.lat + last.lat) / 2;
      const midLng = (prev.lng + last.lng) / 2;

      const tooltip = L.tooltip({
        permanent: true,
        direction: 'top',
        className: 'segment-tooltip',
      })
        .setLatLng([midLat, midLng])
        .setContent(`${dist.toFixed(1)} m`)
        .addTo(map);

      tooltipLayers.push(tooltip);
    });

    map.on('draw:drawstop', () => {
      console.log('Draw stopped', 'drawnLayer exists:', !!drawnLayer); // Debug
      setIsDrawing(false);
      tooltipLayers.forEach((l) => map.removeLayer(l));
      tooltipLayers = [];
      latlngs = [];
      // Don't reset measurements here - let draw:created handle it
      // Only clear if we're in an invalid state (shouldn't happen normally)
    });

    const handleCreated = (e: L.DrawEvents.Created) => {
      const now = Date.now();
      // Prevent duplicate calls within 100ms
      if (now - lastCreatedTime < 100) {
        console.log('Ignoring duplicate polygon created event'); // Debug
        return;
      }
      setLastCreatedTime(now);
      
      console.log('Polygon created', e); // Debug
      setIsDrawing(false);
      tooltipLayers.forEach((l) => map.removeLayer(l));
      tooltipLayers = [];

      const layer = e.layer;
      if (!(layer instanceof L.Polygon)) return;

      if (drawnLayer) featureGroup.removeLayer(drawnLayer);
      featureGroup.clearLayers();

      featureGroup.addLayer(layer);
      setDrawnLayer(layer);

      const rawLatLngs = layer.getLatLngs()[0];
      const latlngs = Array.isArray(rawLatLngs)
        ? (rawLatLngs as L.LatLng[]).map((ll) => new L.LatLng(ll.lat, ll.lng))
        : [];

      if (latlngs.length < 3) return; // Ensure valid polygon

      for (let i = 0; i < latlngs.length; i++) {
        const start = latlngs[i];
        const end = latlngs[(i + 1) % latlngs.length];
        const distance = map.distance(start, end);

        const midLat = (start.lat + end.lat) / 2;
        const midLng = (start.lng + end.lng) / 2;

        const tooltip = L.tooltip({
          permanent: true,
          direction: 'top',
          className: 'segment-tooltip',
        })
          .setLatLng([midLat, midLng])
          .setContent(`${distance.toFixed(1)} m`)
          .addTo(map);

        tooltipLayers.push(tooltip);
      }

      let coords = latlngs.map((ll) => [
        parseFloat(Number(ll.lat).toFixed(6)),
        parseFloat(Number(ll.lng).toFixed(6)),
      ]);

      const first = coords[0];
      const last = coords[coords.length - 1];

      if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
        coords = [...coords, [first[0], first[1]]];
      }

      onPolygonComplete(coords);
      console.log('Polygon created, coords:', coords); // Debug

      const perimeter = L.GeometryUtil.length(latlngs);
      const area = L.GeometryUtil.geodesicArea(latlngs);

      const newMeasurements = {
        perimeter: `${(perimeter / 1000).toFixed(2)} km`,
        area: `${(area / 10000).toFixed(2)} ha`,
      };
      console.log('Setting measurements:', newMeasurements); // Debug
      setMeasurements(newMeasurements);
    };

    const handleEdited = (e: L.LeafletEvent) => {
      console.log('Polygon edited', e); // Debug
      const event = e as L.DrawEvents.Edited;
      const layers = event.layers.getLayers();
      const layer = layers.find((l): l is L.Polygon => l instanceof L.Polygon);
      if (!layer) return;

      tooltipLayers.forEach((l) => map.removeLayer(l));
      tooltipLayers = [];

      const rawLatLngs = layer.getLatLngs()[0];
      const latlngs = Array.isArray(rawLatLngs)
        ? (rawLatLngs as L.LatLng[]).map((ll) => new L.LatLng(ll.lat, ll.lng))
        : [];

      if (latlngs.length < 3) {
        console.log('Invalid polygon after edit, resetting'); // Debug
        featureGroup.clearLayers();
        setDrawnLayer(null);
        onPolygonComplete([]);
        setMeasurements({ perimeter: '0.00 km', area: '0.00 ha' });
        return;
      }

      for (let i = 0; i < latlngs.length; i++) {
        const start = latlngs[i];
        const end = latlngs[(i + 1) % latlngs.length];
        const distance = map.distance(start, end);

        const midLat = (start.lat + end.lat) / 2;
        const midLng = (start.lng + end.lng) / 2;

        const tooltip = L.tooltip({
          permanent: true,
          direction: 'top',
          className: 'segment-tooltip',
        })
          .setLatLng([midLat, midLng])
          .setContent(`${distance.toFixed(1)} m`)
          .addTo(map);

        tooltipLayers.push(tooltip);
      }

      let coords = latlngs.map((ll) => [
        parseFloat(Number(ll.lat).toFixed(6)),
        parseFloat(Number(ll.lng).toFixed(6)),
      ]);

      const first = coords[0];
      const last = coords[coords.length - 1];

      if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
        coords = [...coords, [first[0], first[1]]];
      }

      onPolygonComplete(coords);
      console.log('Updated coordinates in handleEdited:', coords); // Debug

      const perimeter = L.GeometryUtil.length(latlngs);
      const area = L.GeometryUtil.geodesicArea(latlngs);

      setMeasurements({
        perimeter: `${(perimeter / 1000).toFixed(2)} km`,
        area: `${(area / 10000).toFixed(2)} ha`,
      });

      setDrawnLayer(layer);
    };

    const handleDeleted = (e: L.LeafletEvent) => {
      console.log('Polygon deleted', e); // Debug
      tooltipLayers.forEach((l) => map.removeLayer(l));
      tooltipLayers = [];
      featureGroup.clearLayers();
      setDrawnLayer(null);
      onPolygonComplete([]);
      setMeasurements({ perimeter: '0.00 km', area: '0.00 ha' });
    };

    map.on(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      handleCreated(event);
    });

    map.on(L.Draw.Event.EDITED, (e: L.LeafletEvent) => {
      handleEdited(e);
    });

    map.on(L.Draw.Event.DELETED, (e: L.LeafletEvent) => {
      handleDeleted(e);
    });

    // Cleanup
    return () => {
      map.off(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
        const event = e as L.DrawEvents.Created;
        handleCreated(event);
      });
      map.off('draw:drawvertex', (e: L.LeafletEvent) => {
        const event = e as L.DrawEvents.DrawVertex;
        latlngs = event.layers.getLayers().map((l: L.Layer) => (l as L.Marker).getLatLng());
      });
      map.off('draw:drawstart');
      map.off('draw:drawstop');
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      if (newDrawControl) {
        map.removeControl(newDrawControl);
      }
      tooltipLayers.forEach((l) => map.removeLayer(l));
      featureGroup.clearLayers();
      setDrawControl(null);
    };
  }, [map, initialCoords]);

  // Disable draw control when clicking form elements
  useEffect(() => {
    if (!drawControl) return;

    const disableDrawing = (e: Event) => {
      const target = e.target as Node;
      const mapContainer = map.getContainer();
      // Only disable drawing if clicking on form inputs, not just anywhere outside map
      if (isDrawing && !mapContainer.contains(target) && 
          (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
        console.log('Disabling drawing due to form field focus'); // Debug
        drawControl._toolbars.draw._modes.polygon.handler.disable();
        setIsDrawing(false);
      }
    };

    document.addEventListener('click', disableDrawing);
    return () => {
      document.removeEventListener('click', disableDrawing);
    };
  }, [drawControl, isDrawing, map]);

  return null;
};

const ParcelForm: React.FC<ParcelFormProps> = ({ open, onClose, onParcelCreated, existingParcel }) => {
  const [formData, setFormData] = useState<{
    name: string;
    culture: string;
    soil_type: string;
    boundary: { coordinates: number[][][] };
  }>({
    name: '',
    culture: 'NONE',
    soil_type: 'loam',
    boundary: { coordinates: [[]] },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [measurements, setMeasurements] = useState({
    perimeter: '0.00 km',
    area: '0.00 ha',
  });
  const measurementsRef = useRef(measurements);
  
  // Stable callback for updating measurements
  const updateMeasurements = useCallback((newMeasurements: { perimeter: string; area: string }) => {
    // Only update if measurements actually changed
    if (measurementsRef.current.perimeter !== newMeasurements.perimeter || 
        measurementsRef.current.area !== newMeasurements.area) {
      console.log('Updating measurements:', measurementsRef.current, '->', newMeasurements);
      measurementsRef.current = newMeasurements;
      setMeasurements(newMeasurements);
    }
  }, []);

  useEffect(() => {
    if (existingParcel) {
      setIsEditing(true);
      const initialCoords = existingParcel.boundary?.coordinates[0]?.map(([lng, lat]) => [
        parseFloat(Number(lat).toFixed(6)),
        parseFloat(Number(lng).toFixed(6)),
      ]);
      setFormData({
        name: existingParcel.name,
        culture: existingParcel.culture,
        soil_type: existingParcel.soil_type,
        boundary: existingParcel.boundary || { coordinates: [[]] },
      });
      if (initialCoords) {
        const latLngs = initialCoords.map(([lat, lng]) => new L.LatLng(lat, lng));
        const perimeter = L.GeometryUtil.length(latLngs);
        const area = L.GeometryUtil.geodesicArea(latLngs);
        const newMeasurements = {
          perimeter: `${(perimeter / 1000).toFixed(2)} km`,
          area: `${(area / 10000).toFixed(2)} ha`,
        };
        updateMeasurements(newMeasurements);
      } else {
        updateMeasurements({ perimeter: '0.00 km', area: '0.00 ha' });
      }
    } else {
      setIsEditing(false);
      setFormData({
        name: '',
        culture: 'NONE',
        soil_type: 'loam',
        boundary: { coordinates: [[]] },
      });
      updateMeasurements({ perimeter: '0.00 km', area: '0.00 ha' });
    }
    setError('');
  }, [existingParcel, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter a parcel name');
      setLoading(false);
      return;
    }

    if (!formData.boundary.coordinates[0].length || formData.boundary.coordinates[0].length < 3) {
      setError('Please draw a valid parcel boundary');
      setLoading(false);
      return;
    }

    const coords = formData.boundary.coordinates[0];
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
      setError('Polygon must be closed (first and last point must match)');
      setLoading(false);
      return;
    }

    try {
      // Backend only expects: name, culture, soil_type, boundary
      // It calculates area_hectares and perimeter_km automatically
      const payload = {
        name: formData.name,
        culture: formData.culture,
        soil_type: formData.soil_type,
        boundary: {
          // Send coordinates in format that matches validation: coordinates[*][*] = numeric
          // But model expects coordinates[0][*] = [lng, lat], so we need the 3-level structure
          coordinates: formData.boundary.coordinates
        }
      };
      
      console.log('Sending payload to backend:', JSON.stringify(payload, null, 2));
      console.log('Boundary structure being sent:');
      console.log('  - Type of boundary:', typeof payload.boundary);
      console.log('  - Type of coordinates:', typeof payload.boundary.coordinates);
      console.log('  - Coordinates length:', payload.boundary.coordinates.length);
      console.log('  - First ring length:', payload.boundary.coordinates[0]?.length);
      console.log('  - Sample coordinate:', payload.boundary.coordinates[0]?.[0]);
      console.log('  - Sample coordinate type:', typeof payload.boundary.coordinates[0]?.[0]);
      console.log('Frontend measurements (for display only):', {
        area: measurements.area,
        perimeter: measurements.perimeter
      });
      
      if (isEditing && existingParcel) {
        const response = await farmAPI.updateParcel(existingParcel.id, payload);
        onParcelCreated(response.data);
      } else {
        const response = await farmAPI.createParcel(payload);
        onParcelCreated(response.data);
      }
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save parcel');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      culture: 'NONE',
      soil_type: 'loam',
      boundary: { coordinates: [[]] },
    });
    updateMeasurements({ perimeter: '0.00 km', area: '0.00 ha' });
    onClose();
  };

  const handlePolygonComplete = (coords: number[][]) => {
    console.log('Polygon complete, coords:', coords); // Debug
    
    // Only update if we have valid coordinates
    if (coords.length >= 3) {
      setFormData((prev) => ({
        ...prev,
        boundary: {
          coordinates: [coords.map(([lat, lng]) => [lng, lat])],
        },
      }));
    }
    // Don't reset form data if coords is empty - this happens during draw stop
  };

  if (!open) {
    console.log('ParcelForm is not open, returning null');
    return null;
  }
  
  console.log('ParcelForm is open, rendering with data:', { 
    formData: { 
      ...formData, 
      boundary: { 
        coordinates: formData.boundary.coordinates.map(ring => `${ring.length} points`) 
      } 
    }, 
    measurements, 
    isEditing,
    boundaryPointCount: formData.boundary.coordinates[0].length
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Parcel' : 'Create New Parcel'}
              </h2>
              <p className="text-sm text-gray-500">
                {measurements.perimeter} • {measurements.area}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Parcel Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter parcel name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="culture" className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Culture
                </label>
                <select
                  id="culture"
                  name="culture"
                  value={formData.culture}
                  onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="NONE">None</option>
                  <option value="ORANGE">Orange</option>
                  <option value="POTATO">Potato</option>
                  <option value="TOMATO">Tomato</option>
                  <option value="LEMON">Lemon</option>
                  <option value="OLIVE">Olive</option>
                  <option value="PEACH">Peach</option>
                  <option value="WHEAT">Wheat</option>
                  <option value="BARLEY">Barley</option>
                </select>
              </div>

              <div>
                <label htmlFor="soil_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Soil Type
                </label>
                <select
                  id="soil_type"
                  name="soil_type"
                  value={formData.soil_type}
                  onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="loam">Loam</option>
                  <option value="clay">Clay</option>
                  <option value="silt">Silt</option>
                  <option value="sand">Sand</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Draw Parcel Boundary *
              </label>
              <div className="h-96 rounded-lg overflow-hidden relative">
                {loading && (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                )}
                <MapContainer
                  key={`parcel-map-${existingParcel?.id || 'new'}`}
                  center={
                    formData.boundary.coordinates[0].length > 2
                      ? L.latLngBounds(
                          formData.boundary.coordinates[0].map(([lng, lat]) => [lat, lng])
                        ).getCenter()
                      : existingParcel?.boundary?.coordinates
                      ? L.latLngBounds(
                          existingParcel.boundary.coordinates[0].map(([lng, lat]) => [lat, lng])
                        ).getCenter()
                      : [34, 9.5]
                  }
                  zoom={formData.boundary.coordinates[0].length > 2 || existingParcel?.boundary?.coordinates ? 14 : 7}
                  style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {formData.boundary.coordinates[0].length > 2 && (
                    <Polygon
                      key={`polygon-${existingParcel?.id || 'new'}-${formData.boundary.coordinates[0].length}`}
                      positions={formData.boundary.coordinates[0]
                        .filter(([lng, lat]) => typeof lng === 'number' && typeof lat === 'number')
                        .map(([lng, lat]) => [lat, lng] as [number, number])}
                      pathOptions={{
                        color: '#2e7d32',
                        weight: 2,
                        fillColor: '#81c784',
                        fillOpacity: 0.7,
                      }}
                    />
                  )}
                  <MapDrawer
                    onPolygonComplete={handlePolygonComplete}
                    setMeasurements={updateMeasurements}
                    initialCoords={
                      existingParcel?.boundary?.coordinates
                        ? existingParcel.boundary.coordinates[0].map(([lng, lat]) => [
                            parseFloat(Number(lat).toFixed(6)),
                            parseFloat(Number(lng).toFixed(6)),
                          ])
                        : undefined
                    }
                  />
                </MapContainer>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || formData.boundary.coordinates[0].length < 3}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Parcel' : 'Create Parcel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParcelForm;