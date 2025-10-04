import React, { useState } from 'react';
import { Package, DollarSign, AlertTriangle, Archive, Beaker, Droplet } from 'lucide-react';

interface Input {
  id: number;
  name: string;
  input_type: string;
  unit: string;
  unit_price: number;
  current_stock: number;
  minimum_stock_alert: number;
}

interface InputEntry {
  id: number;
  quantity: number;
}

interface InputSelectorProps {
  inputs: Input[];
  selectedInputs: InputEntry[];
  onSelectionChange: (selected: InputEntry[]) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
  label?: string;
}

const InputSelector: React.FC<InputSelectorProps> = ({
  inputs,
  selectedInputs,
  onSelectionChange,
  onQuantityChange,
  onRemove,
  label = "Inputs"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      SEED: 'bg-green-600',
      FERTILIZER: 'bg-amber-600',
      PESTICIDE: 'bg-red-600',
      FUEL: 'bg-blue-600',
    };
    return colors[type.toUpperCase()] || 'bg-gray-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SEED':
        return '🌱';
      case 'FERTILIZER':
        return '🧪';
      case 'PESTICIDE':
        return '🚫';
      case 'FUEL':
        return '⛽';
      default:
        return '📦';
    }
  };

  const isLowStock = (input: Input) => {
    const currentStock = parseFloat(String(input.current_stock)) || 0;
    const minimumAlert = parseFloat(String(input.minimum_stock_alert)) || 0;
    return minimumAlert > 0 && currentStock <= minimumAlert;
  };

  const getStockStatus = (input: Input) => {
    if (isLowStock(input)) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (input.current_stock > input.minimum_stock_alert * 2) 
      return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
  };

  const addInput = (inputId: number) => {
    const newEntry = { id: inputId, quantity: 1 };
    onSelectionChange([...selectedInputs, newEntry]);
    setIsOpen(false);
  };

  const getAvailableInputs = () => {
    const selectedIds = selectedInputs.map(i => i.id);
    return inputs.filter(i => !selectedIds.includes(i.id) && i.current_stock > 0);
  };

  const getInputById = (id: number) => {
    return inputs.find(i => i.id === id);
  };

  const calculateTotalCost = (unitPrice: number, quantity: number) => {
    return (unitPrice * quantity).toFixed(2);
  };

  const hasInsufficientStock = (input: Input, requestedQuantity: number) => {
    return requestedQuantity > input.current_stock;
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
          disabled={getAvailableInputs().length === 0}
        >
          <Package className="h-4 w-4 mr-1" />
          Add Input
        </button>
      </div>

      {/* Selected Inputs List */}
      <div className="space-y-3">
        {selectedInputs.map((entry, index) => {
          const input = getInputById(entry.id);
          if (!input) return null;

          const stockStatus = getStockStatus(input);
          const insufficientStock = hasInsufficientStock(input, entry.quantity);

          return (
            <div key={entry.id} className={`bg-white border-2 rounded-lg p-4 transition-colors ${
              insufficientStock ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Input Icon */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xl">
                      {getTypeIcon(input.input_type)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getTypeColor(input.input_type)} rounded-full border-2 border-white`}></div>
                  </div>

                  {/* Input Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 truncate">{input.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(input.input_type)}`}>
                        {input.input_type}
                      </span>
                      {isLowStock(input) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-red-700 bg-red-100">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Low Stock
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{input.unit_price} DT/{input.unit}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Archive className="h-3 w-3" />
                        <span className={stockStatus.color}>
                          {input.current_stock} {input.unit} available
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Total cost:</span>
                        <span className="text-rose-600 font-semibold">
                          {calculateTotalCost(input.unit_price, entry.quantity)} DT
                        </span>
                      </div>
                    </div>
                    {insufficientStock && (
                      <div className="flex items-center space-x-1 mt-2 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Requested quantity exceeds available stock</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity Input and Remove Button */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={entry.quantity}
                      onChange={(e) => onQuantityChange(index, parseFloat(e.target.value) || 0)}
                      className={`w-20 p-2 border rounded focus:outline-none focus:ring-2 text-center ${
                        insufficientStock 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-rose-500'
                      }`}
                      min="0"
                      step="0.1"
                      max={input.current_stock}
                    />
                    <span className="text-xs text-gray-500">{input.unit}</span>
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

        {selectedInputs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No inputs selected</p>
            <p className="text-sm">Click "Add Input" to select supplies</p>
          </div>
        )}
      </div>

      {/* Input Dropdown */}
      {isOpen && (
        <div className="relative">
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {getAvailableInputs().length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No inputs available</p>
                <p className="text-sm">All inputs used or out of stock</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {getAvailableInputs().map((input) => {
                  const stockStatus = getStockStatus(input);
                  return (
                    <div
                      key={input.id}
                      onClick={() => addInput(input.id)}
                      className="p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-lg">
                            {getTypeIcon(input.input_type)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getTypeColor(input.input_type)} rounded-full border-2 border-white`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{input.name}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getTypeColor(input.input_type)}`}>
                              {input.input_type}
                            </span>
                            {isLowStock(input) && (
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium text-red-700 bg-red-100">
                                <AlertTriangle className="h-2 w-2" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{input.unit_price} DT/{input.unit}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Archive className="h-3 w-3" />
                              <span className={stockStatus.color}>
                                {input.current_stock} {input.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

export default InputSelector;