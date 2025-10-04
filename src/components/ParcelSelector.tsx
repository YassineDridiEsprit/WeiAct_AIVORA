import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Crop, Square } from 'lucide-react';

interface Parcel {
  id: number;
  name: string;
  culture: string;
  soil_type: string;
  area_hectares: number;
  perimeter_km?: number;
  location?: string;
}

interface ParcelSelectorProps {
  parcels: Parcel[];
  selectedParcels: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  placeholder?: string;
  multiple?: boolean;
}

const ParcelSelector: React.FC<ParcelSelectorProps> = ({
  parcels,
  selectedParcels,
  onSelectionChange,
  placeholder = "Select parcels...",
  multiple = true
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getCultureColor = (culture: string) => {
    const colors: { [key: string]: string } = {
      ORANGE: 'bg-orange-500',
      POTATO: 'bg-yellow-500',
      TOMATO: 'bg-red-500',
      LEMON: 'bg-yellow-400',
      OLIVE: 'bg-green-600',
      PEACH: 'bg-pink-500',
      WHEAT: 'bg-amber-600',
      BARLEY: 'bg-amber-500',
      NONE: 'bg-gray-400',
    };
    return colors[culture.toUpperCase()] || 'bg-gray-400';
  };

  const getSoilColor = (soil: string) => {
    const colors: { [key: string]: string } = {
      clay: 'bg-red-300',
      silt: 'bg-blue-300',
      sand: 'bg-yellow-300',
      loam: 'bg-green-300',
    };
    return colors[soil.toLowerCase()] || 'bg-gray-300';
  };

  const toggleParcel = (parcelId: number) => {
    if (multiple) {
      const newSelection = selectedParcels.includes(parcelId)
        ? selectedParcels.filter(id => id !== parcelId)
        : [...selectedParcels, parcelId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([parcelId]);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (selectedParcels.length === 0) return placeholder;
    if (selectedParcels.length === 1) {
      const parcel = parcels.find(p => p.id === selectedParcels[0]);
      return parcel ? `${parcel.name} • ${parcel.area_hectares}ha` : placeholder;
    }
    return `${selectedParcels.length} parcels selected`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
      >
        <span className={selectedParcels.length === 0 ? "text-gray-500" : "text-gray-900"}>
          {getDisplayText()}
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {parcels.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Square className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No parcels available</p>
              <p className="text-sm">Create a parcel first</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {parcels.map((parcel) => {
                const isSelected = selectedParcels.includes(parcel.id);
                return (
                  <div
                    key={parcel.id}
                    onClick={() => toggleParcel(parcel.id)}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-4 h-4 rounded-full ${getCultureColor(parcel.culture)}`}></div>
                          <h3 className="font-semibold text-gray-900">{parcel.name}</h3>
                          {isSelected && (
                            <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Square className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              <span className="font-medium text-gray-900">{parcel.area_hectares}</span> hectares
                            </span>
                          </div>
                          
                          {parcel.perimeter_km && (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                              <span className="text-gray-600">
                                <span className="font-medium text-gray-900">{parcel.perimeter_km}</span> km
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Crop className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 capitalize">{parcel.culture.toLowerCase()}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded ${getSoilColor(parcel.soil_type)}`}></div>
                            <span className="text-gray-600 capitalize">{parcel.soil_type}</span>
                          </div>
                        </div>

                        {parcel.location && (
                          <div className="flex items-center space-x-2 mt-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 truncate">{parcel.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {multiple && parcels.length > 0 && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{selectedParcels.length} of {parcels.length} selected</span>
                {selectedParcels.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onSelectionChange([])}
                    className="text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ParcelSelector;