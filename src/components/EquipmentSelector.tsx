import React, { useState } from 'react';
import { Settings, Clock, DollarSign, Wrench, AlertCircle } from 'lucide-react';

interface Equipment {
  id: number;
  name: string;
  equipment_type: string;
  hourly_cost: number;
}

interface EquipmentEntry {
  id: number;
  total_hours: number;
}

interface EquipmentSelectorProps {
  equipment: Equipment[];
  selectedEquipment: EquipmentEntry[];
  onSelectionChange: (selected: EquipmentEntry[]) => void;
  onHoursChange: (index: number, hours: number) => void;
  onRemove: (index: number) => void;
  label?: string;
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
  equipment,
  selectedEquipment,
  onSelectionChange,
  onHoursChange,
  onRemove,
  label = "Equipment"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      TRACTOR: 'bg-green-600',
      HARVESTER: 'bg-orange-600',
      PLOW: 'bg-brown-600',
      SPRAYER: 'bg-blue-600',
      TILLER: 'bg-purple-600',
      OTHER: 'bg-gray-600',
    };
    return colors[type.toUpperCase()] || 'bg-gray-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'TRACTOR':
        return '🚜';
      case 'HARVESTER':
        return '🌾';
      case 'PLOW':
        return '🔧';
      case 'SPRAYER':
        return '💧';
      case 'TILLER':
        return '⚒️';
      default:
        return '🔧';
    }
  };

  const addEquipment = (equipmentId: number) => {
    const newEntry = { id: equipmentId, total_hours: 8 };
    onSelectionChange([...selectedEquipment, newEntry]);
    setIsOpen(false);
  };

  const getAvailableEquipment = () => {
    const selectedIds = selectedEquipment.map(e => e.id);
    return equipment.filter(e => !selectedIds.includes(e.id));
  };

  const getEquipmentById = (id: number) => {
    return equipment.find(e => e.id === id);
  };

  const calculateTotalCost = (hourlyCost: number, hours: number) => {
    return (hourlyCost * hours).toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-3 py-1 bg-rose-100 text-rose-700 text-sm rounded-lg hover:bg-rose-200 transition-colors"
          disabled={getAvailableEquipment().length === 0}
        >
          <Wrench className="h-4 w-4 mr-1" />
          Add Equipment
        </button>
      </div>

      {/* Selected Equipment List */}
      <div className="space-y-3">
        {selectedEquipment.map((entry, index) => {
          const item = getEquipmentById(entry.id);
          if (!item) return null;

          return (
            <div key={entry.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Equipment Icon */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xl">
                      {getTypeIcon(item.equipment_type)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getTypeColor(item.equipment_type)} rounded-full border-2 border-white`}></div>
                  </div>

                  {/* Equipment Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(item.equipment_type)}`}>
                        {item.equipment_type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{item.hourly_cost} DT/hr</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Total cost:</span>
                        <span className="text-rose-600 font-semibold">
                          {calculateTotalCost(item.hourly_cost, entry.total_hours)} DT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hours Input and Remove Button */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={entry.total_hours}
                      onChange={(e) => onHoursChange(index, parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500 text-center"
                      min="0"
                      step="0.5"
                    />
                    <span className="text-xs text-gray-500">total hrs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {selectedEquipment.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No equipment assigned</p>
            <p className="text-sm">Click "Add Equipment" to assign machinery</p>
          </div>
        )}
      </div>

      {/* Equipment Dropdown */}
      {isOpen && (
        <div className="relative">
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {getAvailableEquipment().length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>All equipment assigned</p>
                <p className="text-sm">or no equipment available</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {getAvailableEquipment().map((item) => (
                  <div
                    key={item.id}
                    onClick={() => addEquipment(item.id)}
                    className="p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-lg">
                          {getTypeIcon(item.equipment_type)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getTypeColor(item.equipment_type)} rounded-full border-2 border-white`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getTypeColor(item.equipment_type)}`}>
                            {item.equipment_type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{item.hourly_cost} DT/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default EquipmentSelector;