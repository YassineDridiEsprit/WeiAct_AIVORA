import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users, UserCheck, Clock, DollarSign } from 'lucide-react';

interface Personnel {
  id: number;
  name: string;
  role: string;
  hourly_rate: number;
}

interface PersonnelEntry {
  id: number;
  daily_hours: number;
}

interface PersonnelSelectorProps {
  personnel: Personnel[];
  selectedPersonnel: PersonnelEntry[];
  onSelectionChange: (selected: PersonnelEntry[]) => void;
  onHoursChange: (index: number, hours: number) => void;
  onRemove: (index: number) => void;
  label?: string;
}

const PersonnelSelector: React.FC<PersonnelSelectorProps> = ({
  personnel,
  selectedPersonnel,
  onSelectionChange,
  onHoursChange,
  onRemove,
  label = "Personnel"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      MANAGER: 'bg-purple-500',
      TECHNICIAN: 'bg-blue-500',
      WORKER: 'bg-green-500',
      SUPERVISOR: 'bg-orange-500',
      OTHER: 'bg-gray-500',
    };
    return colors[role.toUpperCase()] || 'bg-gray-500';
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'MANAGER':
        return '👨‍💼';
      case 'TECHNICIAN':
        return '🔧';
      case 'SUPERVISOR':
        return '👷‍♂️';
      case 'WORKER':
        return '👨‍🌾';
      default:
        return '👤';
    }
  };

  const addPersonnel = (personnelId: number) => {
    const newEntry = { id: personnelId, daily_hours: 8 };
    onSelectionChange([...selectedPersonnel, newEntry]);
    setIsOpen(false);
  };

  const getAvailablePersonnel = () => {
    const selectedIds = selectedPersonnel.map(p => p.id);
    return personnel.filter(p => !selectedIds.includes(p.id));
  };

  const getPersonnelById = (id: number) => {
    return personnel.find(p => p.id === id);
  };

  const calculateDailyCost = (hourlyRate: number, hours: number) => {
    return (hourlyRate * hours).toFixed(2);
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
          disabled={getAvailablePersonnel().length === 0}
        >
          <Users className="h-4 w-4 mr-1" />
          Add Personnel
        </button>
      </div>

      {/* Selected Personnel List */}
      <div className="space-y-3">
        {selectedPersonnel.map((entry, index) => {
          const person = getPersonnelById(entry.id);
          if (!person) return null;

          return (
            <div key={entry.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Avatar and Role */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xl">
                      {getRoleIcon(person.role)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getRoleColor(person.role)} rounded-full border-2 border-white`}></div>
                  </div>

                  {/* Personnel Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(person.role)}`}>
                        {person.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{person.hourly_rate} DT/hr</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Daily cost:</span>
                        <span className="text-rose-600 font-semibold">
                          {calculateDailyCost(person.hourly_rate, entry.daily_hours)} DT
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
                      value={entry.daily_hours}
                      onChange={(e) => onHoursChange(index, parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-500 text-center"
                      min="0"
                      step="0.5"
                    />
                    <span className="text-xs text-gray-500">hrs/day</span>
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

        {selectedPersonnel.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No personnel assigned</p>
            <p className="text-sm">Click "Add Personnel" to assign workers</p>
          </div>
        )}
      </div>

      {/* Personnel Dropdown */}
      {isOpen && (
        <div className="relative">
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {getAvailablePersonnel().length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>All personnel assigned</p>
                <p className="text-sm">or no personnel available</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {getAvailablePersonnel().map((person) => (
                  <div
                    key={person.id}
                    onClick={() => addPersonnel(person.id)}
                    className="p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-lg">
                          {getRoleIcon(person.role)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getRoleColor(person.role)} rounded-full border-2 border-white`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{person.name}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getRoleColor(person.role)}`}>
                            {person.role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{person.hourly_rate} DT/hr</span>
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

export default PersonnelSelector;